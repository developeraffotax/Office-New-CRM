import createIdColumn from "./IdColumn";
import createJobHolderColumn from "./JobHolderColumn";
import createSubjectColumn from "./SubjectColumn";
import { createStartDateColumn, createEndDateColumn } from "./DateColumns";
import createGoalTypeColumn from "./GoalTypeColumn";
import createTargetColumn from "./TargetColumn";
import createAchievedColumn from "./AchievedColumn";
import createOutcomeColumn from "./OutcomeColumn";
import createCommentsColumn from "./CommentsColumn";
import createActionsColumn from "./ActionsColumn";
import createProgressColumn from "./ProgressColumn";

export const getGoalColumns = (ctx) => {
  return [
    createIdColumn(),
    createJobHolderColumn(ctx),
    createSubjectColumn(ctx),
    createStartDateColumn(ctx),
    createEndDateColumn(ctx),
    createGoalTypeColumn(ctx),
    createTargetColumn(ctx),
    createAchievedColumn(),
    createOutcomeColumn(),
    createCommentsColumn(ctx),
    createActionsColumn(ctx),
    createProgressColumn(),
  ];
};

export default getGoalColumns;


