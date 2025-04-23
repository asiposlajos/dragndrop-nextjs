import { useState, useRef } from "react";
import styles from "./ImageSorter.module.css";

export default function ImageSorter() {
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      const [draggedItem] = updatedImages.splice(draggedIndex, 1);
      updatedImages.splice(targetIndex, 0, draggedItem);
      setDraggedIndex(targetIndex);
      return updatedImages;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
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
              draggedIndex === index ? styles.dragging : ""
            }`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
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
          </div>
        ))}
      </div>
    </div>
  );
}
