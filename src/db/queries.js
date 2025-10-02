const db = require('./connection')

const saveCompany = (company) => {
  const query = `INSERT INTO companies (id, name, name_variants, location, description, url, source_url, rating_dreamjob, time_edit)
VALUES (:id, :name, :name_variants, :location, :description, :url, :source_url, :rating_dreamjob, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  name_variants = excluded.name_variants,
  location = excluded.location,
  description = excluded.description,
  url = excluded.url,
  source_url = excluded.source_url,
  rating_dreamjob = excluded.rating_dreamjob
ON CONFLICT(name) DO UPDATE SET
  id = excluded.id,
  name_variants = excluded.name_variants,
  location = excluded.location,
  description = excluded.description,
  url = excluded.url,
  source_url = excluded.source_url,
  rating_dreamjob = excluded.rating_dreamjob`
  const result = db.prepare(query).run({
    id: company.id,
    name: company.name,
    name_variants: company.name_variants,
    location: company.location,
    description: company.description,
    url: company.url,
    source_url: company.source_url,
    rating_dreamjob: company.rating_dreamjob,
  })
  if (result)
    return company.id
  return null
}

const saveVacancy = (vacancy) => {
  const query = `INSERT INTO vacancies (project_id, company_id, contact_id, status_id, work_type_id, time_type_id, source_id, location, [name], url, description, salary_from, salary_to, salary_currency, salary_period_id, is_contacted_by_me, date_publication, date_first_contact, date_archived, time_edit)
VALUES (:project_id, :company_id, :contact_id, :status_id, :work_type_id, :time_type_id, :source_id, :location, :name, :url, :description, :salary_from, :salary_to, :salary_currency, :salary_period_id, :is_contacted_by_me, :date_publication, :date_first_contact, :date_archived, CURRENT_TIMESTAMP)
ON CONFLICT(url) DO UPDATE SET
  company_id = excluded.company_id,
  work_type_id = excluded.work_type_id,
  time_type_id = excluded.time_type_id,
  source_id = excluded.source_id,
  name = excluded.name,
  salary_from = excluded.salary_from,
  salary_to = excluded.salary_to,
  salary_currency = excluded.salary_currency,
  salary_period_id = excluded.salary_period_id,
  date_archived = excluded.date_archived`
  const result = db.prepare(query).run({
    project_id: vacancy.project_id,
    company_id: vacancy.company_id,
    contact_id: vacancy.contact_id,
    status_id: vacancy.status_id,
    work_type_id: vacancy.work_type_id,
    time_type_id: vacancy.time_type_id,
    source_id: vacancy.source_id,
    location: vacancy.location,
    name: vacancy.name,
    url: vacancy.url,
    description: vacancy.description,
    salary_from: vacancy.salary_from,
    salary_to: vacancy.salary_to,
    salary_currency: vacancy.salary_currency,
    salary_period_id: vacancy.salary_period_id,
    is_contacted_by_me: vacancy.is_contacted_by_me,
    date_publication: vacancy.date_publication,
    date_first_contact: vacancy.date_first_contact,
    date_archived: vacancy.date_archived,
  })
  if (result)
    return result.id
  return null
}

const updateVacancyStatus = (url, statusId, dateStatusChange) => {
  const query = `UPDATE vacancies SET status_id = :status_id, date_status_change = :date_status_change, time_edit = CURRENT_TIMESTAMP WHERE url = :url`
  const result = db.prepare(query).run({
    url,
    status_id: statusId,
    date_status_change: dateStatusChange,
  })
  if (result)
    return result
  return null
}

const updateInterviewStatus = (id, statusId, dateStatusChange) => {
  const query = `UPDATE interviews SET status_id = :status_id, date_status_change = :date_status_change, time_edit = CURRENT_TIMESTAMP WHERE id = :id`
  const result = db.prepare(query).run({
    id,
    status_id: statusId,
    date_status_change: dateStatusChange,
  })
  if (result)
    return result
  return null
}

const saveAnalytics = (analytics) => {
  const query = `INSERT INTO vacancy_analytics (headline_id, source_id, amount, session_uuid) VALUES (:headline_id, :source_id, :amount, :session_uuid)`
  const result = db.prepare(query).run({
    headline_id: analytics.headline_id,
    source_id: analytics.source_id,
    amount: analytics.amount,
    session_uuid: analytics.session_uuid,
  })
  if (result)
    return analytics.id
  return null
}

const getHeadlines = (activeOnly = true) => {
  const query = 'SELECT id, name FROM vacancy_analytics_headlines' + (activeOnly ? ' WHERE is_active = 1' : '')
  const result = db.prepare(query).all()
  if (!result) return null
  return result
}

const getAnalyticsSources = (activeOnly = true) => {
  const query = 'SELECT id FROM vacancy_analytics_sources' + (activeOnly ? ' WHERE is_active = 1' : '')
  const result = db.prepare(query).all()
  if (!result) return null
  return result
}

module.exports = {
  saveCompany,
  saveVacancy,
  updateVacancyStatus,
  updateInterviewStatus,
  saveAnalytics,
  getHeadlines,
  getAnalyticsSources,
}
