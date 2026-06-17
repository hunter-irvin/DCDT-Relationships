from __future__ import annotations

from math import cos, radians, sin
from pathlib import Path

from PIL import Image, ImageDraw


SIZE = 1024
OUT_DIR = Path(__file__).resolve().parents[1] / "public" / "object-images"

COLORS = {
    "ink": "#1f2933",
    "black": "#111827",
    "dark": "#2f343b",
    "mid": "#7d8792",
    "steel": "#aeb6bf",
    "light": "#dce2e8",
    "panel": "#f4f6f8",
    "blue": "#0877c9",
    "red": "#cf1f2b",
    "teal": "#0f766e",
    "amber": "#c98512",
    "purple": "#7155d9",
    "copper": "#b87333",
    "screen": "#153a5b",
}

OBJECTS = [
    "facility",
    "lab",
    "zone",
    "hac",
    "aisle",
    "row",
    "rack",
    "chassis",
    "serverNode",
    "gpu",
    "rpp",
    "breaker",
    "rackPdu",
    "psu",
    "plc",
    "chillerPlant",
    "facilitySupplyHeader",
    "facilityReturnHeader",
    "cdu",
    "overheadSupply",
    "rowBranchSupply",
    "rackSupplyManifold",
    "quickDisconnect",
    "coldPlate",
    "serverReturn",
    "rackReturnManifold",
    "rowBranchReturn",
    "overheadReturn",
    "coldAisleAir",
    "serverFans",
    "residualHeat",
    "hotAisleAir",
    "crah",
]


def rgba(color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[index : index + 2], 16) for index in (0, 2, 4)) + (alpha,)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


def line(draw: ImageDraw.ImageDraw, points, color="ink", width=8):
    draw.line(points, fill=rgba(COLORS[color]), width=width, joint="curve")


def pipe(draw: ImageDraw.ImageDraw, points, color="blue", width=18, outline=True):
    if outline:
        draw.line(points, fill=rgba(COLORS["ink"]), width=width + 6, joint="curve")
    draw.line(points, fill=rgba(COLORS[color]), width=width, joint="curve")
    highlight = "#6fb7e9" if color == "blue" else "#f17c82" if color == "red" else "#67c7bd"
    draw.line(points, fill=rgba(highlight, 190), width=max(3, width // 4), joint="curve")


def iso_box(draw: ImageDraw.ImageDraw, x, y, w, h, depth=58, fill="panel", accent=None):
    draw.polygon(
        [(x, y), (x + w, y), (x + w + depth, y - depth), (x + depth, y - depth)],
        fill=rgba(COLORS["light"]),
        outline=rgba(COLORS["ink"]),
    )
    draw.rectangle([x, y, x + w, y + h], fill=rgba(COLORS[fill]), outline=rgba(COLORS["ink"]), width=7)
    draw.polygon(
        [(x + w, y), (x + w + depth, y - depth), (x + w + depth, y + h - depth), (x + w, y + h)],
        fill=rgba(COLORS["steel"]),
        outline=rgba(COLORS["ink"]),
    )
    if accent:
        draw.rounded_rectangle([x + 28, y + 30, x + w - 28, y + 46], radius=8, fill=rgba(COLORS[accent]))


def add_screws(draw, box, count=4):
    x1, y1, x2, y2 = box
    positions = [(x1 + 24, y1 + 24), (x2 - 24, y1 + 24), (x1 + 24, y2 - 24), (x2 - 24, y2 - 24)]
    for x, y in positions[:count]:
        draw.ellipse([x - 7, y - 7, x + 7, y + 7], fill=rgba(COLORS["mid"]), outline=rgba(COLORS["ink"]), width=2)


def rack(draw, x=300, y=210, w=330, h=520, accent="blue"):
    iso_box(draw, x, y, w, h, 58, "dark")
    draw.rectangle([x + 28, y + 38, x + w - 28, y + h - 28], fill=rgba("#151a21"), outline=rgba(COLORS["mid"]), width=4)
    for slot in range(12):
        sy = y + 58 + slot * 36
        draw.rounded_rectangle([x + 52, sy, x + w - 58, sy + 22], radius=5, fill=rgba("#242b35"), outline=rgba(COLORS["steel"]), width=2)
        draw.ellipse([x + w - 88, sy + 7, x + w - 76, sy + 19], fill=rgba(COLORS[accent]))
        draw.rectangle([x + 70, sy + 7, x + 130, sy + 13], fill=rgba("#475569"))
    for yy in range(y + 65, y + h - 60, 62):
        draw.line([x + 34, yy, x + 48, yy], fill=rgba(COLORS["steel"]), width=3)


def server(draw, x=170, y=300, w=600, h=260, return_mode=False):
    iso_box(draw, x, y, w, h, 70, "dark")
    draw.rectangle([x + 50, y + 62, x + w - 70, y + h - 90], fill=rgba("#10151d"), outline=rgba(COLORS["steel"]), width=4)
    for bay in range(4):
        bx = x + 86 + bay * 118
        draw.rounded_rectangle([bx, y + 88, bx + 84, y + 178], radius=8, fill=rgba("#1f2937"), outline=rgba(COLORS["mid"]), width=3)
        draw.line([bx + 14, y + 106, bx + 72, y + 162], fill=rgba(COLORS["blue"]), width=5)
        draw.line([bx + 72, y + 106, bx + 14, y + 162], fill=rgba(COLORS["teal"]), width=3)
    draw.rectangle([x + 70, y + h - 70, x + w - 88, y + h - 42], fill=rgba(COLORS["steel"]))
    for cx in range(x + 115, x + w - 110, 60):
        draw.ellipse([cx - 10, y + h - 65, cx + 10, y + h - 45], fill=rgba(COLORS["mid"]))
    if return_mode:
        pipe(draw, [(110, y + h - 65), (x + 28, y + h - 65)], "red", 16)
        pipe(draw, [(x + w + 20, y + h - 65), (880, y + h - 65)], "red", 16)


def manifold(draw, color="blue"):
    x, y, w, h = 190, 390, 620, 150
    draw.rounded_rectangle([x, y, x + w, y + h], radius=36, fill=rgba("#10151d"), outline=rgba(COLORS["ink"]), width=8)
    draw.rectangle([x + 42, y + 42, x + w - 42, y + h - 42], fill=rgba("#1e2631"))
    for index in range(8):
        cx = x + 72 + index * (w - 144) / 7
        draw.rounded_rectangle([cx - 22, y - 56, cx + 22, y + 22], radius=14, fill=rgba(COLORS[color]), outline=rgba(COLORS["ink"]), width=4)
        draw.rounded_rectangle([cx - 22, y + h - 22, cx + 22, y + h + 56], radius=14, fill=rgba(COLORS[color]), outline=rgba(COLORS["ink"]), width=4)
        draw.ellipse([cx - 12, y + 58, cx + 12, y + 82], fill=rgba(COLORS["steel"]))


def qd(draw):
    for y, color in [(330, "blue"), (520, "red")]:
        pipe(draw, [(120, y + 36), (245, y + 36)], color, 16)
        pipe(draw, [(725, y + 36), (890, y + 36)], color, 16)
        draw.rounded_rectangle([245, y, 725, y + 72], radius=34, fill=rgba(COLORS["light"]), outline=rgba(COLORS["ink"]), width=8)
        for x in [315, 395, 555, 635]:
            draw.rectangle([x, y - 20, x + 38, y + 92], fill=rgba(COLORS["steel"]), outline=rgba(COLORS["ink"]), width=4)
        draw.rectangle([455, y + 8, 515, y + 64], fill=rgba(COLORS["dark"]), outline=rgba(COLORS["ink"]), width=4)


def cdu(draw):
    iso_box(draw, 230, 185, 520, 560, 58, "panel")
    draw.rectangle([260, 230, 520, 700], fill=rgba("#171b20"), outline=rgba(COLORS["ink"]), width=7)
    draw.rectangle([548, 240, 720, 700], fill=rgba("#eef1f4"), outline=rgba(COLORS["steel"]), width=4)
    draw.rectangle([580, 300, 690, 390], fill=rgba(COLORS["screen"]), outline=rgba(COLORS["ink"]), width=5)
    for x in [592, 624, 656]:
        for y in [440, 486]:
            draw.ellipse([x, y, x + 22, y + 22], fill=rgba(COLORS["amber"]), outline=rgba(COLORS["ink"]), width=2)
    pipe(draw, [(390, 320), (390, 560), (520, 560), (520, 685)], "blue", 18)
    pipe(draw, [(430, 320), (430, 520), (500, 520), (500, 685)], "red", 14)
    draw.ellipse([332, 272, 452, 392], outline=rgba(COLORS["amber"]), width=12)
    for angle in range(0, 360, 45):
        draw.line([392, 332, 392 + cos(radians(angle)) * 54, 332 + sin(radians(angle)) * 54], fill=rgba(COLORS["amber"]), width=5)
    draw.ellipse([323, 552, 457, 686], fill=rgba("#063f6b"), outline=rgba(COLORS["ink"]), width=7)
    draw.ellipse([354, 583, 426, 655], fill=rgba(COLORS["blue"]), outline=rgba(COLORS["amber"]), width=7)
    add_screws(draw, (230, 185, 750, 745))


def chiller(draw):
    iso_box(draw, 160, 360, 600, 250, 76, "light")
    for x in [200, 335, 470, 605]:
        draw.rectangle([x, 255, x + 92, 360], fill=rgba(COLORS["steel"]), outline=rgba(COLORS["ink"]), width=6)
        draw.line([x + 15, 282, x + 77, 332], fill=rgba(COLORS["mid"]), width=4)
    draw.ellipse([650, 500, 825, 675], fill=rgba(COLORS["steel"]), outline=rgba(COLORS["ink"]), width=8)
    draw.ellipse([690, 540, 785, 635], fill=rgba(COLORS["mid"]), outline=rgba(COLORS["ink"]), width=5)
    pipe(draw, [(85, 455), (160, 455)], "blue", 18)
    pipe(draw, [(760, 520), (900, 520)], "red", 18)
    for x in [235, 420, 575]:
        draw.rectangle([x, 395, x + 68, 560], fill=rgba("#ccd3da"), outline=rgba(COLORS["mid"]), width=3)


def cooling_tower(draw):
    draw.polygon([(250, 735), (350, 260), (670, 260), (775, 735)], fill=rgba(COLORS["light"]), outline=rgba(COLORS["ink"]), width=8)
    draw.rectangle([300, 205, 720, 285], fill=rgba(COLORS["dark"]), outline=rgba(COLORS["ink"]), width=8)
    for x in [355, 445, 535, 625]:
        draw.arc([x - 38, 135, x + 38, 210], 180, 360, fill=rgba(COLORS["mid"]), width=7)
        draw.line([x, 135, x + 20, 95], fill=rgba(COLORS["mid"]), width=5)
    for x in [315, 710]:
        draw.line([x, 735, x - 55, 850], fill=rgba(COLORS["ink"]), width=8)
        draw.line([x, 735, x + 55, 850], fill=rgba(COLORS["ink"]), width=8)
    for y in [360, 470, 580]:
        draw.line([285, y, 740, y], fill=rgba(COLORS["steel"]), width=4)


def header(draw, primary="blue", secondary="red"):
    for x, color in [(380, primary), (600, secondary)]:
        pipe(draw, [(x, 150), (x, 830)], color, 22)
        for y in [250, 405, 560, 715]:
            draw.rounded_rectangle([x - 42, y - 28, x + 42, y + 28], radius=10, fill=rgba(COLORS["steel"]), outline=rgba(COLORS["ink"]), width=5)
    for y in [285, 525, 760]:
        pipe(draw, [(380, y), (600, y)], primary, 14)
        draw.ellipse([472, y - 25, 528, y + 25], fill=rgba(COLORS["dark"]), outline=rgba(COLORS["ink"]), width=5)


def header_rack(draw, color="blue"):
    for y in [300, 410, 520]:
        pipe(draw, [(125, y), (885, y - 60)], color, 17)
    for x in range(190, 850, 110):
        line(draw, [(x, 250), (x, 690)], "mid", 9)
        line(draw, [(x, 690), (x - 26, 800)], "mid", 7)
    line(draw, [(110, 240), (890, 160)], "ink", 6)
    for x in range(220, 820, 120):
        draw.rectangle([x, 276, x + 70, 318], fill=rgba(COLORS["steel"]), outline=rgba(COLORS["ink"]), width=4)


def cold_plate(draw):
    draw.rounded_rectangle([255, 225, 770, 705], radius=42, fill=rgba(COLORS["copper"]), outline=rgba(COLORS["ink"]), width=9)
    for x in range(310, 730, 58):
        line(draw, [(x, 285), (x, 645)], "dark", 6)
    for y in [330, 440, 550]:
        line(draw, [(310, y), (715, y)], "dark", 4)
    pipe(draw, [(90, 350), (255, 350)], "blue", 18)
    pipe(draw, [(770, 580), (930, 580)], "red", 18)
    draw.ellipse([435, 385, 590, 540], fill=rgba("#d29a64"), outline=rgba(COLORS["ink"]), width=6)
    add_screws(draw, (255, 225, 770, 705))


def air_arrows(draw, color="teal", hot=False):
    for i, x in enumerate([130, 260, 390, 520, 650]):
        y = 310 + (i % 2) * 70
        start = 210 if hot else 700
        end = 720 if hot else 200
        draw.arc([x, y, x + 150, y + 160], 205 if hot else 25, 330 if hot else 155, fill=rgba(COLORS[color]), width=16)
        tip_x = x + (12 if hot else 138)
        tip_y = y + 92
        draw.polygon(
            [(tip_x, tip_y), (tip_x + (-42 if hot else 42), tip_y - 28), (tip_x + (-32 if hot else 32), tip_y + 35)],
            fill=rgba(COLORS[color]),
        )


def fans(draw):
    for x in [170, 390, 610]:
        draw.ellipse([x, 320, x + 180, 500], outline=rgba(COLORS["ink"]), width=10, fill=rgba("#e9eef3"))
        draw.ellipse([x + 72, 392, x + 108, 428], fill=rgba(COLORS["dark"]))
        for angle in [0, 90, 180, 270]:
            draw.polygon(
                [
                    (x + 90, 410),
                    (x + 90 + cos(radians(angle - 25)) * 70, 410 + sin(radians(angle - 25)) * 70),
                    (x + 90 + cos(radians(angle + 25)) * 36, 410 + sin(radians(angle + 25)) * 36),
                ],
                fill=rgba(COLORS["teal"]),
                outline=rgba(COLORS["ink"]),
            )


def abstract_space(draw, kind):
    if kind == "facility":
        iso_box(draw, 170, 300, 620, 300, 84, "panel", "blue")
        for x in [250, 370, 490, 610]:
            draw.rectangle([x, 365, x + 72, 450], fill=rgba("#bed8ec"), outline=rgba(COLORS["ink"]), width=4)
        line(draw, [(210, 650), (780, 650)], "mid", 6)
    elif kind == "lab":
        iso_box(draw, 140, 330, 700, 270, 72, "panel")
        for x in range(210, 800, 120):
            line(draw, [(x, 335), (x, 595)], "mid", 5)
        for y in [420, 510]:
            line(draw, [(150, y), (835, y)], "mid", 5)
    elif kind == "zone":
        draw.rounded_rectangle([200, 250, 820, 690], radius=35, fill=rgba("#eaf6ff", 210), outline=rgba(COLORS["blue"]), width=12)
        for x in [405, 615]:
            line(draw, [(x, 275), (x, 665)], "mid", 7)
        for y in [395, 540]:
            line(draw, [(225, y), (795, y)], "mid", 5)
    elif kind == "hac":
        draw.rounded_rectangle([140, 270, 880, 665], radius=54, fill=rgba("#e8fbf7", 185), outline=rgba(COLORS["teal"]), width=16)
        rack(draw, 245, 335, 155, 225, "teal")
        rack(draw, 610, 335, 155, 225, "teal")
        pipe(draw, [(215, 300), (810, 300)], "red", 10)
    elif kind == "aisle":
        draw.polygon([(140, 750), (370, 220), (620, 220), (880, 750)], outline=rgba(COLORS["ink"]), fill=rgba("#edf2f7", 160), width=10)
        line(draw, [(500, 240), (500, 740)], "blue", 11)
        for y in [360, 500, 640]:
            line(draw, [(235, y), (770, y)], "mid", 4)
    else:
        for x in [110, 370, 630]:
            rack(draw, x, 300, 160, 270, "teal")
        line(draw, [(80, 640), (900, 640)], "ink", 9)


def draw_object(object_id: str) -> Image.Image:
    image, draw = canvas()
    if object_id in {"facility", "lab", "zone", "hac", "aisle", "row"}:
        abstract_space(draw, object_id)
    elif object_id == "rack":
        rack(draw)
    elif object_id == "chassis":
        iso_box(draw, 170, 325, 620, 260, 72, "dark", "blue")
        for y in [382, 448, 514]:
            draw.rectangle([230, y, 730, y + 32], fill=rgba("#141922"), outline=rgba(COLORS["steel"]), width=3)
    elif object_id == "serverNode":
        server(draw)
    elif object_id == "gpu":
        draw.rounded_rectangle([220, 330, 755, 600], radius=40, fill=rgba("#111827"), outline=rgba(COLORS["ink"]), width=9)
        draw.rectangle([275, 385, 510, 555], fill=rgba("#1f2937"), outline=rgba(COLORS["steel"]), width=5)
        draw.ellipse([545, 375, 700, 530], outline=rgba(COLORS["blue"]), width=18)
        draw.ellipse([580, 410, 665, 495], fill=rgba("#0b1220"), outline=rgba(COLORS["steel"]), width=5)
        draw.rectangle([755, 400, 835, 535], fill=rgba(COLORS["steel"]), outline=rgba(COLORS["ink"]), width=6)
    elif object_id == "rpp":
        iso_box(draw, 285, 190, 360, 570, 58, "panel", "amber")
        for y in [285, 390, 495, 600]:
            draw.rectangle([345, y, 585, y + 48], fill=rgba(COLORS["dark"]), outline=rgba(COLORS["ink"]), width=4)
            draw.ellipse([545, y + 15, 565, y + 35], fill=rgba(COLORS["amber"]))
    elif object_id == "breaker":
        iso_box(draw, 310, 210, 310, 520, 54, "panel", "amber")
        for y in [315, 430, 545]:
            draw.rounded_rectangle([380, y, 560, y + 64], radius=12, fill=rgba(COLORS["dark"]), outline=rgba(COLORS["ink"]), width=5)
            draw.rectangle([405, y + 20, 535, y + 36], fill=rgba(COLORS["amber"]))
    elif object_id == "rackPdu":
        draw.rounded_rectangle([190, 420, 835, 545], radius=28, fill=rgba("#10151d"), outline=rgba(COLORS["ink"]), width=9)
        for x in range(255, 780, 72):
            draw.ellipse([x, 458, x + 36, 494], fill=rgba(COLORS["amber"]), outline=rgba(COLORS["ink"]), width=3)
            draw.rectangle([x + 6, 502, x + 30, 522], fill=rgba(COLORS["steel"]))
    elif object_id == "psu":
        iso_box(draw, 230, 370, 520, 190, 62, "dark", "amber")
        draw.ellipse([585, 410, 710, 535], outline=rgba(COLORS["steel"]), width=12)
        for y in [420, 460, 500]:
            line(draw, [(275, y), (500, y)], "mid", 5)
    elif object_id == "plc":
        iso_box(draw, 285, 225, 410, 500, 60, "panel", "purple")
        draw.rectangle([355, 325, 620, 465], fill=rgba(COLORS["screen"]), outline=rgba(COLORS["ink"]), width=7)
        for x in [365, 425, 485, 545, 605]:
            draw.ellipse([x, 535, x + 30, 565], fill=rgba(COLORS["purple"]), outline=rgba(COLORS["ink"]), width=3)
        for y in [595, 640]:
            line(draw, [(340, y), (655, y)], "mid", 5)
    elif object_id == "chillerPlant":
        chiller(draw)
    elif object_id == "facilitySupplyHeader":
        header(draw, "blue", "red")
    elif object_id == "facilityReturnHeader":
        header(draw, "red", "blue")
    elif object_id == "cdu":
        cdu(draw)
    elif object_id in {"overheadSupply", "rowBranchSupply"}:
        header_rack(draw, "blue")
    elif object_id in {"overheadReturn", "rowBranchReturn"}:
        header_rack(draw, "red")
    elif object_id == "rackSupplyManifold":
        manifold(draw, "blue")
    elif object_id == "rackReturnManifold":
        manifold(draw, "red")
    elif object_id == "quickDisconnect":
        qd(draw)
    elif object_id == "coldPlate":
        cold_plate(draw)
    elif object_id == "serverReturn":
        server(draw, return_mode=True)
    elif object_id == "coldAisleAir":
        air_arrows(draw, "teal", False)
    elif object_id == "serverFans":
        fans(draw)
    elif object_id == "residualHeat":
        for x in [300, 430, 560]:
            draw.arc([x, 255, x + 80, 445], 205, 340, fill=rgba(COLORS["red"]), width=12)
            draw.arc([x + 36, 210, x + 135, 410], 205, 340, fill=rgba(COLORS["amber"]), width=10)
        draw.rectangle([230, 625, 785, 680], fill=rgba(COLORS["dark"]), outline=rgba(COLORS["ink"]), width=8)
    elif object_id == "hotAisleAir":
        air_arrows(draw, "red", True)
    elif object_id == "crah":
        iso_box(draw, 285, 210, 420, 540, 62, "panel", "teal")
        draw.rectangle([340, 310, 650, 445], fill=rgba("#dbe9ef"), outline=rgba(COLORS["ink"]), width=6)
        for x in [360, 470, 580]:
            draw.ellipse([x, 555, x + 75, 630], outline=rgba(COLORS["teal"]), width=10)
            draw.ellipse([x + 25, 580, x + 50, 605], fill=rgba(COLORS["dark"]))
        line(draw, [(330, 690), (660, 690)], "mid", 6)
    else:
        iso_box(draw, 240, 300, 520, 330, 64, "panel", "blue")
    return crop_to_product_frame(image)


def crop_to_product_frame(image: Image.Image, fill_ratio: float = 0.88) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image

    crop = image.crop(bbox)
    width, height = crop.size
    target = int(SIZE * fill_ratio)
    scale = min(target / width, target / height)
    new_size = (max(1, int(width * scale)), max(1, int(height * scale)))
    crop = crop.resize(new_size, Image.Resampling.LANCZOS)

    framed = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    framed.alpha_composite(crop, ((SIZE - new_size[0]) // 2, (SIZE - new_size[1]) // 2))
    return framed


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for object_id in OBJECTS:
        draw_object(object_id).save(OUT_DIR / f"{object_id}.png")
    print(f"Generated {len(OBJECTS)} detailed transparent PNG assets at {SIZE}x{SIZE} in {OUT_DIR}")


if __name__ == "__main__":
    main()
