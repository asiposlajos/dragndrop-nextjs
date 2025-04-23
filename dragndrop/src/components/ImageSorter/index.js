import { useState, useRef, useEffect } from "react";
import styles from "./ImageSorter.module.css";

export default function ImageSorter() {
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            src: e.target.result,
            file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragStart = (index, e) => {
    setDraggedIndex(index);

    const rect = e.currentTarget.getBoundingClientRect();
    if (e.type === "touchstart") {
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setDragPosition({
        x: touch.clientX,
        y: touch.clientY,
      });
    } else {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragPosition({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleDragMove = (e) => {
    if (draggedIndex === null) return;

    let clientX, clientY;

    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setDragPosition({ x: clientX, y: clientY });

    if (!e.touches) {
      const elements = document.elementsFromPoint(clientX, clientY);
      const target = elements.find((el) =>
        el.classList.contains(styles.imageWrapper)
      );

      if (target) {
        const index = Array.from(target.parentNode.children).indexOf(target);
        if (index !== -1 && index !== draggedIndex) {
          setHoverIndex(index);
        }
      }
    }
  };

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      hoverIndex !== null &&
      draggedIndex !== hoverIndex
    ) {
      const newImages = [...images];
      const [movedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(hoverIndex, 0, movedImage);
      setImages(newImages);
    }
    setDraggedIndex(null);
    setHoverIndex(null);
  };

  const handleTouchMoveInContainer = (e) => {
    if (draggedIndex === null) return;
    e.preventDefault();

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - containerRect.left;
    const y = touch.clientY - containerRect.top;

    setDragPosition({ x: touch.clientX, y: touch.clientY });

    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const target = elements.find((el) =>
      el.classList.contains(styles.imageWrapper)
    );

    if (target) {
      const index = Array.from(target.parentNode.children).indexOf(target);
      if (index !== -1 && index !== draggedIndex) {
        setHoverIndex(index);
      }
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [draggedIndex, hoverIndex]);

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseMove={handleDragMove}
      onTouchMove={handleTouchMoveInContainer}
    >
      <div className={styles.uploadArea}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*"
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className={styles.uploadButton}
        >
          Képek feltöltése
        </button>
        <p className={styles.hint}>Vagy húzd ide a képeket</p>
      </div>

      <div className={styles.imageGrid}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`${styles.imageWrapper} ${
              index === draggedIndex ? styles.dragging : ""
            } ${index === hoverIndex ? styles.hoverOver : ""}`}
            draggable="true"
            onDragStart={(e) => handleDragStart(index, e)}
            onMouseDown={(e) => handleDragStart(index, e)}
            onTouchStart={(e) => handleDragStart(index, e)}
            onDragOver={(e) => e.preventDefault()}
          >
            <img
              src={image.src}
              alt={`Preview ${index}`}
              className={styles.image}
            />
            <button
              onClick={() => removeImage(index)}
              className={styles.removeButton}
            >
              ×
            </button>
            {index === hoverIndex && (
              <div className={styles.dropIndicator}>
                {index < draggedIndex ? "←" : "→"}
              </div>
            )}
          </div>
        ))}
      </div>

      {draggedIndex !== null && (
        <div
          className={styles.draggedPreview}
          style={{
            left: `${dragPosition.x - dragOffset.x}px`,
            top: `${dragPosition.y - dragOffset.y}px`,
            width: "150px",
            height: "150px",
            transform: "scale(1.05)",
          }}
        >
          <img
            src={images[draggedIndex].src}
            alt="Dragged preview"
            className={styles.image}
          />
        </div>
      )}
    </div>
  );
}
