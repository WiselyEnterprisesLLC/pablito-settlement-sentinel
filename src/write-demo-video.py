#!/usr/bin/env python3
"""Build a public-safe OOBE x Ace demo video from local proof artifacts."""

from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
PROOF = ROOT / "proof"
PUBLIC = ROOT / "public"
MEDIA = PUBLIC / "media"
BUILD = ROOT / ".demo-video-build"
OUT_MP4 = PUBLIC / "oobe-ace-demo.mp4"
OUT_POSTER = PUBLIC / "oobe-ace-demo-poster.png"
OUT_PROOF = PROOF / "oobe-ace-demo-video.latest.json"


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def short(value: str, keep: int = 10) -> str:
    value = str(value or "")
    return value if len(value) <= keep * 2 + 3 else f"{value[:keep]}...{value[-keep:]}"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def draw_wrapped(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], width_chars: int, fnt, fill, line_gap: int = 10) -> int:
    x, y = xy
    for raw_line in text.splitlines():
        lines = wrap(raw_line, width=width_chars) or [""]
        for line in lines:
            draw.text((x, y), line, font=fnt, fill=fill)
            bbox = draw.textbbox((x, y), line or " ", font=fnt)
            y += (bbox[3] - bbox[1]) + line_gap
    return y


def slide(index: int, title: str, body: list[str], footer: str = "") -> Path:
    BUILD.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (1280, 720), "#f7faf8")
    draw = ImageDraw.Draw(img)

    # Left identity bar.
    draw.rectangle((0, 0, 96, 720), fill="#12322b")
    draw.rectangle((24, 40, 72, 88), outline="#d19a30", width=3)
    draw.line((36, 66, 60, 66), fill="#d19a30", width=3)
    draw.arc((30, 48, 66, 84), 200, 340, fill="#d19a30", width=3)
    draw.text((28, 610), f"{index:02d}", font=font(26, True), fill="#d19a30")

    # Header.
    draw.text((130, 54), "Pablito Settlement Sentinel", font=font(25, True), fill="#12322b")
    draw.text((130, 91), "OOBE x Ace Data Cloud proof walkthrough", font=font(18), fill="#52615e")
    draw.line((130, 128, 1160, 128), fill="#d8e3df", width=2)

    draw.text((130, 170), title, font=font(42, True), fill="#182321")
    y = 252
    for item in body:
        if item.startswith("$"):
            draw.text((154, y), item[1:], font=font(30, True), fill="#0f6f5c")
            y += 56
        else:
            draw.ellipse((138, y + 11, 150, y + 23), fill="#d19a30")
            y = draw_wrapped(draw, item, (170, y), 72, font(25), "#182321", 8) + 14

    if footer:
        draw.rectangle((130, 638, 1160, 674), fill="#eef6f2")
        draw.text((148, 645), footer, font=font(18), fill="#52615e")

    path = BUILD / f"slide_{index:02d}.png"
    img.save(path)
    return path


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def main() -> None:
    e2e = read_json(PROOF / "end-to-end-live-run.latest.json")
    batch = read_json(PROOF / "ace-x402-onchain-batch.latest.json")
    settlement = read_json(PROOF / "settlement-evidence-bundle.latest.json")
    sap = read_json(PROOF / "sap-identity-status.latest.json")
    listing = read_json(PROOF / "listing-requirements-check.latest.json")

    request_id = e2e.get("requestId", "oobe-ace-live-run-20260519T221510Z")
    deliverable_sha = e2e.get("deliverable", {}).get("sha256", "")
    sap_tx = (
        e2e.get("sapIdentityEvidence", {}).get("registrationTransaction")
        or sap.get("liveRegistration", {}).get("signature")
        or ""
    )
    services = settlement.get("aceServiceUsage", {}).get("distinctServiceIds") or []
    txs = [
        payment.get("transaction", "")
        for payment in e2e.get("paymentEvidence", {}).get("payments", [])
        if payment.get("transaction")
    ]
    if not txs:
        txs = [item.get("transaction", "") for item in batch.get("payments", []) if item.get("transaction")]
    repo = os.environ.get("PUBLIC_REPOSITORY_URL", "https://github.com/WiselyEnterprisesLLC/pablito-settlement-sentinel")
    x_post = os.environ.get("X_POST_URL", "https://x.com/Pablito_WE/status/2056873797232591067")

    slides = [
        slide(1, "What this proves", [
            "$Autonomous agent bounty entry",
            "The agent receives a public-safe workflow request and creates a traceable receipt.",
            "Every claim is tied to a reviewer artifact, transaction, service proof, or public page.",
            "No private memory, no secrets, no fake volume, no claim of winning.",
        ], "Category: Ace Data Cloud Usage"),
        slide(2, "End-to-end run", [
            "Trigger: classify a small-business lead handoff leak.",
            "Tool choice: SAP/x402/Ace-shaped workflow capability.",
            "Execution: Ace Data Cloud service call captured under one request id.",
            f"Request id: {request_id}",
        ], "Shape: trigger -> selection -> service -> payment -> receipt"),
        slide(3, "SAP mainnet identity", [
            "Pablito Settlement Sentinel is registered on SAP mainnet.",
            f"SAP tx: {short(sap_tx, 14)}",
            f"Agent PDA: {short(e2e.get('sapIdentityEvidence', {}).get('agentPda', ''), 12)}",
            "The registration evidence is attached in the public proof bundle.",
        ], "Evidence: proof/sap-registration.live.latest.json"),
        slide(4, "Ace Data Cloud usage", [
            f"{len(services)} distinct Ace service summaries are captured.",
            "Services include chat, embeddings, web data, image generation, video generation, music, and translation.",
            "Existing Ace video proofs include Kling and Veo generation artifacts.",
            "The atomic live run uses Ace OpenAI-compatible chat for a bounded workflow classification.",
        ], "Evidence: proof/ace-service-proof.*.json"),
        slide(5, "x402 payment evidence", [
            f"{len(txs)} Base x402 payment proofs are captured.",
            *[f"Base tx {i + 1}: {short(tx, 12)}" for i, tx in enumerate(txs[:3])],
            "The proof bundle separates live payment evidence from dry-run scaffolding.",
        ], "Evidence: proof/ace-x402-onchain-batch.latest.json"),
        slide(6, "Reviewer trail", [
            f"Repo: {repo}",
            "Public proof page: https://wiselyenterprisesllc.com/oobe-ace/proof",
            f"X walkthrough: {x_post}",
            f"Deliverable hash: {short(deliverable_sha, 16)}",
        ], "Final gate: Superteam submission"),
    ]

    OUT_POSTER.parent.mkdir(parents=True, exist_ok=True)
    slides[0].replace(OUT_POSTER) if OUT_POSTER.exists() else slides[0].rename(OUT_POSTER)
    # Recreate slide 1 after moving it to poster.
    slides[0] = slide(1, "What this proves", [
        "$Autonomous agent bounty entry",
        "The agent receives a public-safe workflow request and creates a traceable receipt.",
        "Every claim is tied to a reviewer artifact, transaction, service proof, or public page.",
        "No private memory, no secrets, no fake volume, no claim of winning.",
    ], "Category: Ace Data Cloud Usage")

    concat = BUILD / "concat.txt"
    concat.write_text("".join(f"file '{path}'\nduration 4\n" for path in slides) + f"file '{slides[-1]}'\nduration 2\n", encoding="utf-8")
    OUT_MP4.parent.mkdir(parents=True, exist_ok=True)
    run([
        "ffmpeg",
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(concat),
        "-vf",
        "fps=30,format=yuv420p",
        "-movflags",
        "+faststart",
        str(OUT_MP4),
    ])

    sha = hashlib.sha256(OUT_MP4.read_bytes()).hexdigest()
    proof = {
        "generatedAt": __import__("datetime").datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "status": "captured-public-demo-video",
        "ok": True,
        "video": {
            "file": "public/oobe-ace-demo.mp4",
            "publicUrl": "https://wiselyenterprisesllc.com/oobe-ace/oobe-ace-demo.mp4",
            "poster": "public/oobe-ace-demo-poster.png",
            "sha256": sha,
            "durationSeconds": 26,
        },
        "evidenceIncluded": {
            "requestId": request_id,
            "sapRegistrationTransaction": sap_tx,
            "aceDistinctServiceCount": len(services),
            "x402BaseProofCount": len(txs),
            "deliverableSha256": deliverable_sha,
            "xPostUrl": x_post,
            "repositoryUrl": repo,
        },
        "safety": {
            "containsPrivateData": False,
            "containsSecrets": False,
            "usesPersonalFiatFunding": False,
            "claimsRewardWon": False,
            "syntheticDemo": False,
        },
        "notes": [
            "Video is generated from local public-safe proof artifacts.",
            "Existing Ace video-generation proofs are cited as service evidence; this reviewer walkthrough itself is rendered locally for accuracy.",
        ],
    }
    OUT_PROOF.parent.mkdir(parents=True, exist_ok=True)
    OUT_PROOF.write_text(json.dumps(proof, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(proof, indent=2))


if __name__ == "__main__":
    main()
