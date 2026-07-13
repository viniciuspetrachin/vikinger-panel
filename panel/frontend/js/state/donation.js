// Doações e licenciamento comercial (links via /api/version).

export const donation = {
  donationInfo: {
    links: [],
    pix_key: "",
    commercial_email: "",
    commercial_url: "",
    license: "",
    license_url: "",
  },

  getDonationPitch() {
    void this.localeVersion;
    return this.t("donation.pitch");
  },

  async loadDonationInfo() {
    try {
      const v = await this.api("GET", "/api/version");
      this.donationInfo = {
        links: v.donation?.links || [],
        pix_key: v.donation?.pix_key || "",
        commercial_email: v.donation?.commercial_email || "",
        commercial_url: v.donation?.commercial_url || "",
        license: v.license || "",
        license_url: v.license_url || "",
      };
    } catch {
      /* silencioso */
    }
  },

  hasDonationOptions() {
    return (
      (this.donationInfo.links || []).length > 0 ||
      !!this.donationInfo.pix_key
    );
  },
};
