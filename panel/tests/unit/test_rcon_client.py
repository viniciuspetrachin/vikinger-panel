"""Testes do cliente RCON (protocolo e quirks do ValheimRcon)."""

import socket
import struct
import threading

import pytest

from rcon_client import (
    SERVERDATA_AUTH,
    SERVERDATA_AUTH_RESPONSE,
    SERVERDATA_EXECCOMMAND,
    SERVERDATA_RESPONSE_VALUE,
    RconError,
    _pack_packet,
    _read_command_response,
    rcon_command,
)


def _send_packet(conn: socket.socket, req_id: int, req_type: int, body: str) -> None:
    conn.sendall(_pack_packet(req_id, req_type, body))


def test_read_command_response_valheim_command_type():
    """ValheimRcon responde com PacketType.Command (2) e requestId espelhado."""
    client_sock, server_sock = socket.socketpair()
    try:
        _send_packet(server_sock, 2, SERVERDATA_EXECCOMMAND, "Sent to chat - teste")
        result = _read_command_response(
            client_sock, cmd_id=2, response_timeout=2.0, idle_timeout=0.2
        )
        assert result == "Sent to chat - teste"
    finally:
        client_sock.close()
        server_sock.close()


def test_read_command_response_negative_id():
    """ValheimRcon responde say/save com id=-1 — deve encerrar sem timeout."""
    client_sock, server_sock = socket.socketpair()
    try:
        _send_packet(server_sock, -1, SERVERDATA_RESPONSE_VALUE, "Sent to chat - teste")
        result = _read_command_response(
            client_sock, cmd_id=2, response_timeout=2.0, idle_timeout=0.2
        )
        assert result == "Sent to chat - teste"
    finally:
        client_sock.close()
        server_sock.close()


def test_read_command_response_multipacket_with_empty_terminator():
    client_sock, server_sock = socket.socketpair()
    try:
        _send_packet(server_sock, 2, SERVERDATA_RESPONSE_VALUE, "kick\nban")
        _send_packet(server_sock, 2, SERVERDATA_RESPONSE_VALUE, "save")
        _send_packet(server_sock, 2, SERVERDATA_RESPONSE_VALUE, "")
        result = _read_command_response(
            client_sock, cmd_id=2, response_timeout=2.0, idle_timeout=0.2
        )
        assert result == "kick\nban\nsave"
    finally:
        client_sock.close()
        server_sock.close()


def test_read_command_response_idle_after_single_packet():
    """Pacote único sem terminador vazio — encerra após idle."""
    client_sock, server_sock = socket.socketpair()
    try:
        _send_packet(server_sock, 2, SERVERDATA_RESPONSE_VALUE, "ok")
        result = _read_command_response(
            client_sock, cmd_id=2, response_timeout=2.0, idle_timeout=0.15
        )
        assert result == "ok"
    finally:
        client_sock.close()
        server_sock.close()


def test_rcon_command_end_to_end_mock_server():
    """Servidor mock estilo ValheimRcon: login + say com tipo Command (2)."""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("127.0.0.1", 0))
    server.listen(1)
    host, port = server.getsockname()

    def handle(conn: socket.socket) -> None:
        try:
            while True:
                raw_size = conn.recv(4)
                if not raw_size:
                    break
                size = struct.unpack("<i", raw_size)[0]
                data = conn.recv(size)
                req_id, req_type = struct.unpack("<ii", data[:8])
                body = data[8:-2].decode("utf-8", errors="replace")
                if req_type == SERVERDATA_AUTH:
                    _send_packet(conn, req_id, SERVERDATA_EXECCOMMAND, "Login success")
                elif req_type == SERVERDATA_EXECCOMMAND:
                    _send_packet(conn, req_id, SERVERDATA_EXECCOMMAND, f"Sent to chat - {body.split(maxsplit=1)[-1] if body.startswith('say') else body}")
                    break
        finally:
            conn.close()
        server.close()

    thread = threading.Thread(target=lambda: handle(server.accept()[0]), daemon=True)
    thread.start()

    result = rcon_command("say teste", host=host, port=port, password="secret", response_timeout=2.0)
    assert result == "Sent to chat - teste"
    thread.join(timeout=2)


def test_rcon_command_auth_rejects_bad_password():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(("127.0.0.1", 0))
    server.listen(1)
    host, port = server.getsockname()

    def handle(conn: socket.socket) -> None:
        try:
            raw_size = conn.recv(4)
            size = struct.unpack("<i", raw_size)[0]
            conn.recv(size)
            _send_packet(conn, -1, SERVERDATA_AUTH_RESPONSE, "")
        finally:
            conn.close()
        server.close()

    thread = threading.Thread(target=lambda: handle(server.accept()[0]), daemon=True)
    thread.start()

    with pytest.raises(RconError, match="RCON authentication failed"):
        rcon_command("save", host=host, port=port, password="wrong", response_timeout=2.0)
    thread.join(timeout=2)
