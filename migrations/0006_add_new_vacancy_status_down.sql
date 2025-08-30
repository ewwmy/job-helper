DELETE FROM "vacancy_statuses" WHERE "id" = 'proposed';
ALTER TABLE "vacancies" ADD COLUMN "is_contacted_by_me" INTEGER;
