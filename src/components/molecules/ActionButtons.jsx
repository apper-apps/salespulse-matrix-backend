import Button from "@/components/atoms/Button";

const ActionButtons = ({ onEdit, onDelete, onView, showView = true, showEdit = true, showDelete = true }) => {
  return (
    <div className="flex items-center space-x-2">
      {showView && onView && (
        <Button
          variant="ghost"
          size="small"
          icon="Eye"
          onClick={onView}
          className="text-gray-600 hover:text-primary-600"
        />
      )}
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="small"
          icon="Edit2"
          onClick={onEdit}
          className="text-gray-600 hover:text-primary-600"
        />
      )}
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="small"
          icon="Trash2"
          onClick={onDelete}
          className="text-gray-600 hover:text-red-600"
        />
      )}
    </div>
  );
};

export default ActionButtons;