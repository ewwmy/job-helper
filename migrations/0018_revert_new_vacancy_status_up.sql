ALTER TABLE "vacancies" ADD COLUMN "is_contacted_by_me" INTEGER;
UPDATE "vacancies" SET "is_contacted_by_me" = 0 WHERE "status_id" = 'proposed';
UPDATE "vacancies" SET "is_contacted_by_me" = 1 WHERE "status_id" <> 'proposed';
