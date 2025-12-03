import os
import random
import shutil

# Base paths
BASE_DIR = "data"
SOURCE_DIR = os.path.join(BASE_DIR, "images")
TRAIN_DIR = os.path.join(BASE_DIR, "train")
VAL_DIR = os.path.join(BASE_DIR, "val")
TEST_DIR = os.path.join(BASE_DIR, "test")

# Supported image extensions
IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff")

# Train/Val/Test split ratios
SPLIT_RATIOS = {
    "train": 0.7,
    "val": 0.15,
    "test": 0.15,
}

random.seed(42)  # For reproducibility


def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def is_image(fname: str) -> bool:
    return fname.lower().endswith(IMAGE_EXTS)


def check_empty(path: str):
    """Ensure the directory is empty before writing."""
    if os.path.exists(path) and os.listdir(path):
        raise RuntimeError(f"{path} is not empty. Clear it before running.")


def main():
    print(f"Source directory: {os.path.abspath(SOURCE_DIR)}")

    if not os.path.isdir(SOURCE_DIR):
        raise RuntimeError(f"Source directory not found: {SOURCE_DIR}")

    # Prepare train/val/test dirs
    for split_dir in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
        ensure_dir(split_dir)
        check_empty(split_dir)

    # Get all class folders
    class_names = sorted(
        d for d in os.listdir(SOURCE_DIR)
        if os.path.isdir(os.path.join(SOURCE_DIR, d))
    )

    print("\nClasses detected:")
    for cname in class_names:
        print(" -", cname)

    total_src = 0
    total_split = {"train": 0, "val": 0, "test": 0}

    # Process every class folder
    for class_name in class_names:
        src_dir = os.path.join(SOURCE_DIR, class_name)
        print(f"\nProcessing: {class_name}")

        files = [f for f in os.listdir(src_dir) if is_image(f)]
        files.sort()

        if not files:
            print("  -> No images found, skipping.")
            continue

        random.shuffle(files)
        n = len(files)
        total_src += n

        n_train = int(n * SPLIT_RATIOS["train"])
        n_val = int(n * SPLIT_RATIOS["val"])
        n_test = n - n_train - n_val  # Remaining goes to test

        splits = {
            "train": files[:n_train],
            "val": files[n_train:n_train + n_val],
            "test": files[n_train + n_val:],
        }

        for split_name, split_files in splits.items():
            dst_dir = os.path.join(BASE_DIR, split_name, class_name)
            ensure_dir(dst_dir)

            print(f"  {split_name}: {len(split_files)} images")
            total_split[split_name] += len(split_files)

            for fname in split_files:
                shutil.copy2(os.path.join(src_dir, fname),
                             os.path.join(dst_dir, fname))

    print(f"Total images: {total_src}")
    print(f"Train: {total_split['train']}")
    print(f"Val:   {total_split['val']}")
    print(f"Test:  {total_split['test']}")
    print("Dataset split completed.")


if __name__ == "__main__":
    main()
