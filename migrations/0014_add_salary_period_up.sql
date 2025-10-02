ROLLBACK;

PRAGMA foreign_keys = OFF;

BEGIN;

CREATE TABLE "salary_periods" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  PRIMARY KEY("id")
);

INSERT INTO "salary_periods" ("id", "name") VALUES ('hour', 'в час');
INSERT INTO "salary_periods" ("id", "name") VALUES ('day', 'в день');
INSERT INTO "salary_periods" ("id", "name") VALUES ('week', 'в неделю');
INSERT INTO "salary_periods" ("id", "name") VALUES ('month', 'в месяц');
INSERT INTO "salary_periods" ("id", "name") VALUES ('year', 'в год');

CREATE TABLE "vacancies_new" (
	"id"	INTEGER NOT NULL,
	"project_id"	TEXT,
	"company_id"	TEXT,
	"hr_agency_id"	TEXT,
	"contact_id"	INTEGER,
	"status_id"	TEXT NOT NULL DEFAULT 'draft',
	"work_type_id"	TEXT,
	"time_type_id"	TEXT,
	"source_id"	TEXT,
	"location"	TEXT,
	"name"	TEXT NOT NULL,
	"url"	TEXT UNIQUE,
	"description"	TEXT,
	"salary_from"	REAL,
	"salary_to"	REAL,
	"salary_currency"	TEXT,
	"salary_period_id"	TEXT,
	"cover_letter"	TEXT,
	"time_create"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"time_edit"	TEXT,
	"date_status_change"	TEXT,
	"date_publication"	TEXT,
	"date_first_contact"	TEXT,
	"date_archived"	TEXT,
	"is_favorite"	INTEGER NOT NULL DEFAULT 0,
	"communication_log"	TEXT,
	"comment"	TEXT,
	"is_blacklisted"	INTEGER NOT NULL DEFAULT 0,
	"date_blacklist_change"	TEXT,
	PRIMARY KEY("id"),
	FOREIGN KEY("company_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("contact_id") REFERENCES "contacts"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("hr_agency_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("project_id") REFERENCES "projects"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("source_id") REFERENCES "sources"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("status_id") REFERENCES "vacancy_statuses"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("time_type_id") REFERENCES "vacancy_time_types"("id") ON UPDATE CASCADE ON DELETE SET NULL,
	FOREIGN KEY("work_type_id") REFERENCES "vacancy_work_types"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY("salary_period_id") REFERENCES "salary_periods"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT INTO "vacancies_new" ("comment","communication_log","company_id","contact_id","cover_letter","date_archived","date_blacklist_change","date_first_contact","date_publication","date_status_change","description","hr_agency_id","id","is_blacklisted","is_favorite","location","name","project_id","salary_currency","salary_from","salary_to","source_id","status_id","time_create","time_edit","time_type_id","url","work_type_id") SELECT "comment","communication_log","company_id","contact_id","cover_letter","date_archived","date_blacklist_change","date_first_contact","date_publication","date_status_change","description","hr_agency_id","id","is_blacklisted","is_favorite","location","name","project_id","currency","salary_from","salary_to","source_id","status_id","time_create","time_edit","time_type_id","url","work_type_id" FROM "vacancies";

DROP TABLE "vacancies";
ALTER TABLE "vacancies_new" RENAME TO "vacancies";

UPDATE "vacancies" SET "salary_period_id" = 'month' WHERE "salary_from" IS NOT NULL OR "salary_to" IS NOT NULL;

COMMIT;

PRAGMA foreign_keys = ON;

BEGIN;
