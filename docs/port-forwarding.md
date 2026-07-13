# Port forwarding — let friends join from the internet

Valheim uses **UDP** ports **2456**, **2457**, and **2458**. Your router must send traffic on those ports to the machine running Vikinger Panel.

---

## Quick checklist

- [ ] Server machine has a **fixed local IP** (DHCP reservation in router)
- [ ] Linux firewall allows UDP 2456–2458
- [ ] Router forwards UDP 2456–2458 → server local IP
- [ ] Friends connect with **Join IP**: `YOUR_PUBLIC_IP:2456`
- [ ] Server password shared separately (if set)

---

## Find your public IP

Friends need your **public** (WAN) IP, not `192.168.x.x`.

- Visit [ifconfig.me](https://ifconfig.me) from the server, or
- Check your router's status page

The panel **Overview** tab also shows connection info when configured.

> **Note:** Home IPs can change. Consider a free Dynamic DNS service (No-IP, DuckDNS) if your IP is not static.

---

## Linux firewall (ufw)

If you use `ufw`:

```bash
sudo ufw allow 2456:2458/udp
sudo ufw allow 8080/tcp   # optional — only if you want remote panel access
sudo ufw reload
```

For **panel access from the internet**, restrict `8080` to trusted IPs or use a VPN — the panel has no login by default.

---

## Router port forwarding

Every router brand differs, but the settings are the same:

| Setting | Value |
|---------|-------|
| Protocol | **UDP** (not TCP) |
| External port | 2456–2458 (or three separate rules) |
| Internal IP | Your server's LAN IP (e.g. `192.168.1.50`) |
| Internal port | 2456–2458 |

### Example labels in router UI

- "Port Forwarding" / "Virtual Server" / "NAT"
- "Service": custom / Valheim
- "WAN port" = external, "LAN port" = internal

### Test locally first

Before blaming the router, confirm the server works on your LAN:

```
192.168.x.x:2456
```

If LAN works but WAN does not, the issue is almost always port forwarding or ISP CGNAT.

---

## Cloud VPS (Hetzner, DigitalOcean, etc.)

Cloud providers use a **security group** or **firewall** instead of a home router:

1. Open **UDP 2456–2458** in the provider firewall
2. Use the VPS **public IP** directly — no NAT loopback issues
3. Optionally open **TCP 8080** for the panel (restrict by IP if possible)

---

## CGNAT — when forwarding does not work

Some ISPs put you behind **Carrier-Grade NAT**. Symptoms:

- Port forwarding is configured correctly but friends still cannot connect
- Your "public" IP in the router differs from what ifconfig.me shows

**Workarounds:**

- Ask ISP for a **public IP** (sometimes paid)
- Host on a **VPS** with a real public IP (~$5/month)
- Use **Steam friends join** only on LAN (not a full fix for internet play)

---

## Valheim public server list

The in-game **Community** server list is unreliable and slow. **Always prefer Join IP** with `IP:2456`.

To appear in the list (optional):

- On the panel **Server** tab, ensure the server is **public**
- `SERVER_PUBLIC=true` in `.env`
- Wait several minutes — listing is not guaranteed

---

## Crossplay (PC + Xbox / Game Pass)

On the **Server** tab, add `-crossplay` in **Extra arguments** and restart. Port requirements stay the same.

---

## Related

- [Getting started](getting-started.md)
- [Troubleshooting — players cannot connect](troubleshooting.md#players-cannot-connect)
- [FAQ](faq.md)
