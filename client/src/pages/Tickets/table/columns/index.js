import { idColumn } from "./idColumn";
import { clientNameColumn } from "./clientNameColumn";
import { companyNameColumn } from "./companyNameColumn";
import { companyColumn } from "./companyColumn";
import { jobHolderColumn } from "./jobHolderColumn";
import { jobStatusColumn } from "./jobStatusColumn";
import { subjectColumn } from "./subjectColumn";
import { sentColumn } from "./sentColumn";
import { receivedColumn } from "./receivedColumn";
import { statusColumn } from "./statusColumn";
import { dateColumn } from "./dateColumn";
import { jobDateColumn } from "./jobDateColumn";
import { lastRepliedColumn } from "./lastRepliedColumn";
import { actionsColumn } from "./actionsColumn";
import { refColumn } from "./refColumn";

 


export const getTicketsColumns = (ctx) => [
  idColumn(),
  refColumn(),
  companyNameColumn(ctx),
  clientNameColumn(ctx),
  companyColumn(ctx),
  jobHolderColumn(ctx),
  jobStatusColumn(ctx),
  subjectColumn(ctx),
  receivedColumn(ctx),
  sentColumn(ctx),
  statusColumn(ctx),
  dateColumn(ctx),
  jobDateColumn(ctx),
  lastRepliedColumn(ctx),
  actionsColumn(ctx),
   
];