import { describe, expect, it } from "vitest";
import { checkHostAllowed, isPrivateIp, type LookupFn } from "./ssrf";

describe("isPrivateIp", () => {
  it("flags IPv4 loopback, private, link-local, and metadata ranges", () => {
    for (const ip of [
      "127.0.0.1",
      "127.1.2.3",
      "10.0.0.1",
      "10.255.255.255",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.0.1",
      "192.168.1.1",
      "169.254.0.1",
      "169.254.169.254", // AWS/GCP/Azure metadata endpoint
      "100.64.0.1", // CGNAT
      "0.0.0.0",
      "255.255.255.255",
      "224.0.0.1", // multicast
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("flags special-use / non-routable documentation & benchmarking ranges", () => {
    for (const ip of [
      "192.0.0.1", // 192.0.0.0/24 IETF protocol assignments
      "192.0.2.5", // TEST-NET-1
      "198.18.0.1", // 198.18.0.0/15 benchmarking
      "198.19.255.1", // 198.18.0.0/15 benchmarking (upper half)
      "198.51.100.7", // TEST-NET-2
      "203.0.113.7", // TEST-NET-3
      "240.0.0.1", // reserved
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("allows ordinary public IPv4", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.0.1", "172.32.0.1", "11.0.0.1", "198.20.0.1"]) {
      expect(isPrivateIp(ip), ip).toBe(false);
    }
  });

  it("flags IPv6 loopback, unspecified, ULA, and link-local", () => {
    for (const ip of ["::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "ff02::1", "[::1]"]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("flags IPv4-mapped IPv6 pointing at private space", () => {
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateIp("::ffff:169.254.169.254")).toBe(true);
    expect(isPrivateIp("::ffff:10.0.0.1")).toBe(true);
  });

  it("allows public IPv6 and IPv4-mapped public addresses", () => {
    expect(isPrivateIp("2606:4700:4700::1111")).toBe(false); // Cloudflare DNS
    expect(isPrivateIp("::ffff:8.8.8.8")).toBe(false);
  });

  it("returns false for non-IP strings (handled later via DNS)", () => {
    expect(isPrivateIp("example.com")).toBe(false);
    expect(isPrivateIp("not-an-ip")).toBe(false);
  });
});

describe("checkHostAllowed", () => {
  const lookupTo = (address: string): LookupFn => async () => [{ address, family: address.includes(":") ? 6 : 4 }];

  it("blocks localhost and internal suffixes without DNS", async () => {
    for (const host of ["localhost", "foo.localhost", "service.local", "db.internal", "metadata.google.internal"]) {
      const result = await checkHostAllowed(host, lookupTo("8.8.8.8"));
      expect(result.allowed, host).toBe(false);
    }
  });

  it("blocks literal private IPs without DNS", async () => {
    const calls: string[] = [];
    const spy: LookupFn = async (h) => {
      calls.push(h);
      return [{ address: "8.8.8.8", family: 4 }];
    };
    const result = await checkHostAllowed("169.254.169.254", spy);
    expect(result.allowed).toBe(false);
    expect(calls).toHaveLength(0); // never resolved an IP literal
  });

  it("blocks a public hostname that resolves to a private address", async () => {
    const result = await checkHostAllowed("evil.example.com", lookupTo("10.0.0.5"));
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toMatch(/private/i);
  });

  it("blocks when any resolved address is private (mixed result)", async () => {
    const lookupFn: LookupFn = async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "169.254.169.254", family: 4 },
    ];
    expect((await checkHostAllowed("mixed.example.com", lookupFn)).allowed).toBe(false);
  });

  it("allows a public hostname that resolves to a public address", async () => {
    expect((await checkHostAllowed("example.com", lookupTo("93.184.216.34"))).allowed).toBe(true);
  });

  it("blocks when DNS resolution fails or returns nothing", async () => {
    const throwing: LookupFn = async () => {
      throw new Error("ENOTFOUND");
    };
    expect((await checkHostAllowed("nope.example.com", throwing)).allowed).toBe(false);
    const empty: LookupFn = async () => [];
    expect((await checkHostAllowed("empty.example.com", empty)).allowed).toBe(false);
  });
});
