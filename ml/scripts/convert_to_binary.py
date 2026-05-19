import os
import shutil

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_ROOT = os.path.join(PROJECT_ROOT, "ml", "datasets")

# Choose how to merge the 'moderate' class into binary classes.
# Options: "critical" or "healthy"
MERGE_MODERATE_INTO = "critical"

SPLITS = ["train", "validation", "test"]


def move_all(src_dir, dst_dir):
    if not os.path.isdir(src_dir):
        return 0
    os.makedirs(dst_dir, exist_ok=True)
    moved = 0
    for name in os.listdir(src_dir):
        src_path = os.path.join(src_dir, name)
        if os.path.isfile(src_path):
            dst_path = os.path.join(dst_dir, name)
            shutil.move(src_path, dst_path)
            moved += 1
    return moved


def main():
    total_moved = 0
    for split in SPLITS:
        split_dir = os.path.join(DATA_ROOT, split)
        moderate_dir = os.path.join(split_dir, "moderate")
        target_dir = os.path.join(split_dir, MERGE_MODERATE_INTO)
        moved = move_all(moderate_dir, target_dir)
        total_moved += moved
        if moved > 0:
            print(f"Moved {moved} images from {moderate_dir} -> {target_dir}")

    # Remove empty moderate folders
    for split in SPLITS:
        moderate_dir = os.path.join(DATA_ROOT, split, "moderate")
        if os.path.isdir(moderate_dir) and not os.listdir(moderate_dir):
            try:
                os.rmdir(moderate_dir)
                print(f"Removed empty folder: {moderate_dir}")
            except PermissionError:
                print(f"Could not remove folder (permission): {moderate_dir}")

    print(f"Done. Total moved: {total_moved}")


if __name__ == "__main__":
    main()
