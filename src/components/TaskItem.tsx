// TaskItem.tsx
import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FiX } from 'react-icons/fi'

interface Task {
  id: string;
  title: string;
  isComplete: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function TaskItem({ task, onToggle, onRemove, onRename }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const editInputRef = useRef<HTMLInputElement>(null);
  // evita que o commit do onBlur rode de novo depois que Enter/Esc já trataram o evento
  const skipNextBlurRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  function startEditing() {
    setDraftTitle(task.title);
    setIsEditing(true);
  }

  function commitEdit() {
    if (skipNextBlurRef.current) {
      skipNextBlurRef.current = false;
      return;
    }

    const trimmedTitle = draftTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      onRename(task.id, trimmedTitle);
    }
    setIsEditing(false);
  }

  function cancelEdit() {
    skipNextBlurRef.current = true;
    setDraftTitle(task.title);
    setIsEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      commitEdit();
      // o input desmonta a seguir e dispara blur; já commitamos, então ignora
      skipNextBlurRef.current = true;
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task ${isDragging ? 'is-dragging' : ''}`}
      data-testid="task"
    >
      <button
        type="button"
        className="grip"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <span className="grip-dots">
          <i /><i />
          <i /><i />
          <i /><i />
        </span>
      </button>

      <button
        type="button"
        role="checkbox"
        aria-checked={task.isComplete}
        aria-label={task.isComplete ? 'Marcar como não concluída' : 'Marcar como concluída'}
        className={`dot ${task.isComplete ? 'is-checked' : ''}`}
        onClick={() => onToggle(task.id)}
      />
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          className="task-title-input"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={commitEdit}
        />
      ) : (
        <button
          type="button"
          className={`task-title ${task.isComplete ? 'is-complete' : ''}`}
          onClick={startEditing}
        >
          {task.title}
        </button>
      )}
      <button
        type="button"
        className="remove"
        data-testid="remove-task-button"
        aria-label="Remover tarefa"
        onClick={() => onRemove(task.id)}
      >
        <FiX size={16} />
      </button>
    </li>
  );
}
