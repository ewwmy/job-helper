INSERT INTO "vacancy_statuses" ("id", "title", "description") VALUES ('proposed', 'Получил предложение', NULL);
ALTER TABLE "vacancies" DROP COLUMN "is_contacted_by_me";
