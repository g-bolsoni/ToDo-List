// TaskItem.tsx
import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FiX, FiPlus, FiChevronRight } from 'react-icons/fi'
import type { Task } from '../types/task'
import { SubtaskItem } from './SubtaskItem'

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onRemoveSubtask: (taskId: string, subtaskId: string) => void;
  onReorderSubtasks: (taskId: string, oldIndex: number, newIndex: number) => void;
}

export function TaskItem({
  task,
  onToggle,
  onRemove,
  onRename,
  onAddSubtask,
  onToggleSubtask,
  onRemoveSubtask,
  onReorderSubtasks,
}: TaskItemProps) {
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

  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter(subtask => subtask.isComplete).length;

  const subtaskSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  function handleCreateSubtask() {
    const trimmedTitle = newSubtaskTitle.trim();
    if (!trimmedTitle) return;

    onAddSubtask(task.id, trimmedTitle);
    setNewSubtaskTitle('');
    subtaskInputRef.current?.focus();
  }

  function handleSubtaskInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleCreateSubtask();
    }
  }

  function handleSubtaskDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subtasks.findIndex(subtask => subtask.id === active.id);
    const newIndex = subtasks.findIndex(subtask => subtask.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorderSubtasks(task.id, oldIndex, newIndex);
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task ${isDragging ? 'is-dragging' : ''}`}
      data-testid="task"
    >
      <div className="task-row">
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
        {subtasks.length > 0 && (
          <span className="subtask-count">{completedSubtasks}/{subtasks.length}</span>
        )}
        <button
          type="button"
          className={`subtask-toggle ${isSubtasksExpanded ? 'is-expanded' : ''}`}
          aria-label={isSubtasksExpanded ? 'Recolher subtarefas' : 'Expandir subtarefas'}
          aria-expanded={isSubtasksExpanded}
          onClick={() => setIsSubtasksExpanded(prev => !prev)}
        >
          <FiChevronRight size={14} />
        </button>
        <button
          type="button"
          className="remove"
          data-testid="remove-task-button"
          aria-label="Remover tarefa"
          onClick={() => onRemove(task.id)}
        >
          <FiX size={16} />
        </button>
      </div>

      {isSubtasksExpanded && (
        <div className="subtasks-panel">
          <div className="subtask-input-row">
            <input
              ref={subtaskInputRef}
              type="text"
              placeholder="Adicionar subtarefa"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={handleSubtaskInputKeyDown}
            />
            <button
              type="button"
              data-testid="add-subtask-button"
              aria-label="Adicionar subtarefa"
              onClick={handleCreateSubtask}
            >
              <FiPlus size={14} />
            </button>
          </div>

          {subtasks.length > 0 && (
            <DndContext
              sensors={subtaskSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubtaskDragEnd}
            >
              <SortableContext items={subtasks.map(subtask => subtask.id)} strategy={verticalListSortingStrategy}>
                <ul className="subtasks">
                  {subtasks.map(subtask => (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      taskId={task.id}
                      onToggle={onToggleSubtask}
                      onRemove={onRemoveSubtask}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </li>
  );
}
