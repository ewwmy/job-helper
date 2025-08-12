#!/bin/bash

source ./titles.sh

# headhunter
for title in "${TITLES[@]}"; do
	http -b GET "https://hh.ru/search/vacancy?text=$title&search_field=name&excluded_text=&salary=&salary=&salary_mode=&currency_code=RUR&experience=doesNotMatter&order_by=relevance&search_period=0&items_on_page=50&L_save_area=true&hhtmFrom=vacancy_search_filter" | grep -oP '<h1[^>]*>.*?</h1>' | sed -E 's/<\/?[^>]+>//g'
done

# linkedin
for title in "${TITLES[@]}"; do
	# russia
	# https://www.linkedin.com/jobs/search/?currentJobId=4266159978&geoId=101728296&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_LOCATION_AUTOCOMPLETE&refresh=true

	# united states
	# https://www.linkedin.com/jobs/search/?currentJobId=4282419315&geoId=103644278&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# canada
	# https://www.linkedin.com/jobs/search/?currentJobId=4219897401&geoId=101174742&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# eurasia
	# https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# european union
	# https://www.linkedin.com/jobs/search/?currentJobId=4270271974&geoId=91000000&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# netherlands
	# https://www.linkedin.com/jobs/search/?currentJobId=4280124242&geoId=102890719&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# united kingdom
	# https://www.linkedin.com/jobs/search/?currentJobId=4271864680&geoId=101165590&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# germany
	# https://www.linkedin.com/jobs/search/?currentJobId=4278238645&geoId=101282230&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# spain
	# https://www.linkedin.com/jobs/search/?currentJobId=4281490999&geoId=105646813&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# portugal
	# https://www.linkedin.com/jobs/search/?currentJobId=4261113369&geoId=100364837&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# cyprus
	# https://www.linkedin.com/jobs/search/?currentJobId=4278333385&geoId=106774002&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# georgia
	# https://www.linkedin.com/jobs/search/?currentJobId=4278329763&geoId=106315325&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# armenia
	# https://www.linkedin.com/jobs/search/?currentJobId=4278329770&geoId=103030111&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# latin america
	# https://www.linkedin.com/jobs/search/?currentJobId=4270514484&geoId=91000011&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# south asia
	# https://www.linkedin.com/jobs/search/?currentJobId=4143880596&geoId=91000013&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# southeast asia
	# https://www.linkedin.com/jobs/search/?currentJobId=4269126376&geoId=91000014&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# east asia
	# https://www.linkedin.com/jobs/search/?currentJobId=4267645152&geoId=91000012&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# kyrgyzstan
	# https://www.linkedin.com/jobs/search/?currentJobId=4275382913&geoId=103490790&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# kazakhstan
	# https://www.linkedin.com/jobs/search/?currentJobId=4278327882&geoId=106049128&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# united arab emirates (uae)
	# https://www.linkedin.com/jobs/search/?currentJobId=4281931860&geoId=104305776&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# australia
	# https://www.linkedin.com/jobs/search/?currentJobId=4277140431&geoId=101452733&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# new zealand
	# https://www.linkedin.com/jobs/search/?currentJobId=4278957985&geoId=105490917&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	# australia and new zealand
	# https://www.linkedin.com/jobs/search/?currentJobId=4277140431&geoId=91000015&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	http -b GET "https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords=$title&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true" | tr -d '\n' | grep -oP '<h1 class="results-context-header__context">.*</h1>' | grep -oP '<span class="results-context-header__job-count">[^<]+|<span class="results-context-header__query-search">[^<]+' | sed -e 'N;s/\n/: /;s/<[^>]*>//g;s/.*span.//'
done
