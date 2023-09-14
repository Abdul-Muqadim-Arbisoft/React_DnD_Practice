import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const ItemType = {
  ITEM: 'ITEM'
};

const DraggableItem = ({ item, index, listId, moveItem }) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType.ITEM,
    item: { index, listId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType.ITEM,
    hover: (draggedItem) => {
      if (draggedItem.listId !== listId || draggedItem.index !== index) {
        draggedItem.targetListId = listId;
        draggedItem.targetIndex = index;
      }
    },
    drop: (draggedItem) => {
      if (draggedItem.targetListId && draggedItem.targetIndex !== undefined) {
        moveItem(draggedItem.listId, draggedItem.index, draggedItem.targetListId, draggedItem.targetIndex);
        delete draggedItem.targetListId;
        delete draggedItem.targetIndex;
      }
    }
  });

  const itemStyle = isDragging ? { opacity: 0, transform: 'rotate(-15deg)' } : {};

  return (
    <div className="draggable-item" ref={(node) => ref(drop(node))} style={itemStyle}>
      {item}
    </div>
  );
};

const ListBlock = ({ items, listId, moveItem }) => {
  const ref = useRef(null);
  
  const [, drop] = useDrop({
    accept: ItemType.ITEM,
    hover: (draggedItem) => {
      if (!ref.current) return;

      if (draggedItem.listId !== listId) {
        draggedItem.targetListId = listId;
        draggedItem.targetIndex = items.length;
      }
    },
    drop: (draggedItem) => {
      if (draggedItem.targetListId && draggedItem.targetIndex !== undefined) {
        moveItem(draggedItem.listId, draggedItem.index, draggedItem.targetListId, draggedItem.targetIndex);
        delete draggedItem.targetListId;
        delete draggedItem.targetIndex;
      }
    }
  });

  return (
    <div className="list-block" ref={node => { ref.current = node; drop(node); }}>
      {items.map((item, index) => (
        <DraggableItem
          key={index}
          index={index}
          listId={listId}
          item={item}
          moveItem={moveItem}
        />
      ))}
    </div>
  );
};

const App = () => {
  const [lists, setLists] = useState({
    list1: ['Item 1a', 'Item 1b', 'Item 1c'],
    list2: ['Item 2a', 'Item 2b', 'Item 2c'],
    list3: ['Item 3a', 'Item 3b', 'Item 3c']
  });

  const moveItem = (fromListId, fromIndex, toListId, toIndex) => {
    const updatedLists = { ...lists };
    const [movedItem] = updatedLists[fromListId].splice(fromIndex, 1);

    if (updatedLists[toListId].length === 0) {
      toIndex = 0;
    }

    updatedLists[toListId].splice(toIndex, 0, movedItem);
    setLists(updatedLists);
  };

  const addNewList = () => {
    const newId = `list${Object.keys(lists).length + 1}`;
    setLists(prev => ({ ...prev, [newId]: [] }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        {Object.keys(lists).map((listId) => (
          <ListBlock key={listId} listId={listId} items={lists[listId]} moveItem={moveItem} />
        ))}
        <button onClick={addNewList} className="add-list-btn">Add New List</button>
      </div>
    </DndProvider>
  );
};

export default App;
