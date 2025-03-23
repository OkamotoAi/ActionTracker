export interface Action {
  action_id: number;
  user_id: number;
  start: string;
  end: string | null;
  category: string;
}

export interface EditingProps {
  action: Action;
  editedAction: Partial<Action>;
  setEditedAction: (action: Partial<Action>) => void;
  // setActions: (actions: Action[]) => void;
  // setEditingId: (id: number | null) => void;
  handleSave: (id: number) => void;
}

export interface ShowingViewProps {
  action: Action;
  editingId: number | null;
  // setEditingId: (id: number | null) => void;
  // setEditedAction: (action: Partial<Action>) => void;
  // setActions: (actions: Action[]) => void;
  handleEdit: (action: Action) => void;
  handleDelete: (id: number) => void;
  handleSave: (id: number) => void;
}
