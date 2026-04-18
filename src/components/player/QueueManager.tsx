const handleDragStart = (e: any, index: number) => {
  setDraggedIndex(index);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index.toString());
};

const handleDragOver = (e: any) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
};

const handleDrop = (e: any, dropIndex: number) => {
  e.preventDefault();
  const draggedItem = e.dataTransfer.getData('text/plain');

  if (draggedItem !== '') {
    const dragIndex = parseInt(draggedItem, 10);
    if (dragIndex !== dropIndex) {
      reorderQueue(dragIndex, dropIndex);
    }
  }

  setDraggedIndex(null);
};