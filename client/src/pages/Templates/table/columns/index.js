import createCategoryColumn from "./CategoryColumn";
import createNameColumn from "./NameColumn";
import createDescriptionColumn from "./DescriptionColumn";
import createCopyColumn from "./CopyColumn";
import createActionsColumn from "./ActionsColumn";
import createUserListColumn from "./UserListColumn";
import { refColumn } from "./refColumn";

export const createTemplateColumns = ({
  categoryData,
  setTemplate,
  setShowTemplate,
  copyTemplate,
  duplicateTemplate,
  setTemplateId,
  setAddTemplate,
  handleDeleteTemplateConfirmation,
  userName,
}) => [
  refColumn(),
  createCategoryColumn({ categoryData }),
  createNameColumn(),
  createDescriptionColumn({ setTemplate, setShowTemplate }),
  createCopyColumn({ copyTemplate }),
  createActionsColumn({
    duplicateTemplate,
    setTemplateId,
    setAddTemplate,
    handleDeleteTemplateConfirmation,
  }),
  createUserListColumn({ userName }),
];

export {
  createCategoryColumn,
  createNameColumn,
  createDescriptionColumn,
  createCopyColumn,
  createActionsColumn,
  createUserListColumn,
};

export default createTemplateColumns;


