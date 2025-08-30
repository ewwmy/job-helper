DROP VIEW vacancy_stats_daily;

CREATE VIEW vacancy_stats_daily AS
SELECT
	vah.name AS headline_name,
	vasp.name AS sphere_name,
	vast.name AS stack_name,
	AVG(va.amount) as avg_amount,
	va.date_check AS date_check
FROM vacancy_analytics_headlines AS vah
LEFT JOIN vacancy_analytics AS va ON va.headline_id = vah.id
LEFT JOIN vacancy_analytics_sources AS vasrc ON vasrc.id = va.source_id
LEFT JOIN vacancy_analytics_spheres AS vasp ON vasp.id = vah.sphere_id
LEFT JOIN vacancy_analytics_stack AS vast ON vast.id = vah.stack_id
WHERE vah.is_active = 1 AND vasrc.is_active = 1
GROUP BY date_check, sphere_id, stack_id
ORDER BY headline_id, date_check;
