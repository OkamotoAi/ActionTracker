import React from "react";
import { Action, EditingProps, ShowingViewProps } from "./types";
import { useState, useEffect } from "react";
import axios from "axios";
import "bulma/css/bulma.css";

function formatTimestamp(timestamp: string | number | Date) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0から始まるため+1する
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}-${day} ${hours}:${minutes}`;
}

const EditingView = ({
  action,
  editedAction,
  setEditedAction,
  handleSave,
}: EditingProps) => {
  return (
    <>
      <td className="border p-2">
        <input
          type="datetime-local"
          value={editedAction.start}
          onChange={(e) =>
            setEditedAction({
              ...editedAction,
              start: e.target.value,
            })
          }
          className="border p-1"
        />
      </td>
      <td className="border p-2">
        <input
          type="datetime-local"
          value={action.end ? formatTimestamp(action.end.toString()) : "-"}
          onChange={(e) =>
            setEditedAction({
              ...editedAction,
              end: e.target.value,
            })
          }
          className="border p-1"
        />
      </td>
      <td className="border p-2">
        <div className="select">
          <select
            value={editedAction.category}
            onChange={(e) =>
              setEditedAction({
                ...editedAction,
                category: e.target.value,
              })
            }
          >
            <option value="睡眠">睡眠</option>
            <option value="外出">外出</option>
            <option value="勉強">勉強</option>
            <option value="食事">食事</option>
          </select>
        </div>
      </td>
      <td className="border p-2">
        <button
          onClick={() => handleSave(action.action_id)}
          className="button is-info px-2 py-1"
        >
          Save
        </button>
      </td>
    </>
  );
};

const ShowingView = ({
  action,
  editingId,
  handleEdit,
  handleDelete,
}: ShowingViewProps) => {
  return (
    <>
      <td className="border p-2">{formatTimestamp(action.start.toString())}</td>
      <td className="border p-2">
        {action.end ? formatTimestamp(action.end.toString()) : "-"}
      </td>
      <td className="border p-2">{action.category}</td>
      <td className="border p-2">
        <button
          onClick={() => handleEdit(action)}
          className="button is-light px-2 py-1 mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(action.action_id)}
          className="button is-light px-2 py-1"
        >
          Delete
        </button>
      </td>
    </>
  );
};

export default function App() {
  const [actions, setActions] = useState<Action[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedAction, setEditedAction] = useState<Partial<Action>>({});

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start: formData.get("start"),
        end: formData.get("end"),
        category: formData.get("category"),
      }),
    };

    fetch(`http://localhost:3001/actions`, requestOptions)
      .then(() => {
        setEditingId(null);
      })
      .catch((error) => console.error("Error updating action:", error));
  };

  const handleSave = (id: number) => {
    axios
      .put(`http://localhost:3001/actions/${id}`, editedAction)
      .then(() => {
        setActions(
          actions.map((action) =>
            action.action_id === id ? { ...action, ...editedAction } : action
          )
        );
        setEditingId(null);
      })
      .catch((error) => console.error("Error updating action:", error));
  };

  const handleEdit = (action: Action) => {
    setEditingId(action.action_id);
    setEditedAction({ ...action });
  };

  const handleDelete = (id: number) => {
    axios
      .delete(`http://localhost:3001/actions/${id}`)
      .then(() =>
        setActions(actions.filter((action) => action.action_id !== id))
      )
      .catch((error) => console.error("Error deleting action:", error));
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/actions")
      .then((response) => setActions(response.data))
      .catch((error) => console.error("Error fetching actions:", error));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Action Tracker</h1>
      <div className="m-4 p-4 border rounded">
        <form className="flex space-x-2 mt-2 control tile" onSubmit={handleAdd}>
          <input
            type="datetime-local"
            name="start"
            className="border p-2 m-2 rounded is-2 tile"
          />
          <input
            type="datetime-local"
            name="end"
            className="border p-2 m-2 rounded w-1/3 tile"
          />
          <div className="select p-2 mx-2 ">
            <select name="category">
              <option value="睡眠">睡眠</option>
              <option value="外出">外出</option>
              <option value="勉強">勉強</option>
              <option value="食事">食事</option>
            </select>
          </div>
          {/* <input
            type="text"
            name="category"
            className="border p-2 m-2 rounded w-1/3"
            placeholder="カテゴリ"
          /> */}
          <button
            className="button is-primary px-4 py-2 mt-2 rounded"
            type="submit"
          >
            Add
          </button>
        </form>
      </div>

      <table className="w-full mt-4 border border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Start</th>
            <th className="border p-2">End</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action: Action) => (
            <tr key={action.action_id}>
              {editingId === action.action_id ? (
                <EditingView
                  action={action}
                  editedAction={editedAction}
                  setEditedAction={setEditedAction}
                  handleSave={() => handleSave(action.action_id)}
                />
              ) : (
                <ShowingView
                  action={action}
                  editingId={editingId}
                  handleEdit={() => handleEdit(action)}
                  handleDelete={() => handleDelete(action.action_id)}
                  handleSave={() => handleSave(action.action_id)}
                />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
