// SubtaskItem.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FiX } from 'react-icons/fi'
import type { SubTask } from '../types/task'

interface SubtaskItemProps {
  subtask: SubTask;
  taskId: string;
  onToggle: (taskId: string, subtaskId: string) => void;
  onRemove: (taskId: string, subtaskId: string) => void;
}

export function SubtaskItem({ subtask, taskId, onToggle, onRemove }: SubtaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`subtask ${isDragging ? 'is-dragging' : ''}`}
      data-testid="subtask"
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
        aria-checked={subtask.isComplete}
        aria-label={subtask.isComplete ? 'Marcar como não concluída' : 'Marcar como concluída'}
        className={`dot ${subtask.isComplete ? 'is-checked' : ''}`}
        onClick={() => onToggle(taskId, subtask.id)}
      />
      <p className={subtask.isComplete ? 'is-complete' : ''}>{subtask.title}</p>
      <button
        type="button"
        className="remove"
        data-testid="remove-subtask-button"
        aria-label="Remover subtarefa"
        onClick={() => onRemove(taskId, subtask.id)}
      >
        <FiX size={14} />
      </button>
    </li>
  );
}
