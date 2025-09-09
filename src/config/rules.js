const { XPathResult } = require('../utils/dom')

const RULES = {
  hh: {
    vacancy: {
      name: {
        xpath: '//*/h1[@data-qa="vacancy-title"]/text()',
        type: XPathResult.STRING_TYPE,
      },
      salary: {
        xpath: '//*/span[contains(@data-qa, "vacancy-salary-compensation")]',
        type: XPathResult.STRING_TYPE,
      },
      timeType: {
        xpath: '//*/div[@data-qa="common-employment-text"]',
        type: XPathResult.STRING_TYPE,
      },
      workType: {
        xpath: '//*/p[@data-qa="work-formats-text"]',
        type: XPathResult.STRING_TYPE,
      },
      companyName: {
        xpath: '//*/a[@data-qa="vacancy-company-name"]/span',
        type: XPathResult.STRING_TYPE,
      },
      companyUrl: {
        xpath: '//*/a[@data-qa="vacancy-company-name"]/@href',
        type: XPathResult.STRING_TYPE,
      },
      head: {
        xpath: '//*[@id="HH-React-Root"]/div/div[4]/div[1]/div/div/div/div/div[1]/div[1]/div[1]/div',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      body: {
        xpath: '//*/div[@class="g-user-content"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      bodyBranded: {
        xpath: '//*/div[@class="vacancy-branded-description"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      skills: {
        xpath: '//*/ul[contains(@class, "vacancy-skill-list")]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      address: {
        xpath: '//*/span[@data-qa="vacancy-view-raw-address"]',
        type: XPathResult.STRING_TYPE,
      },
      published: {
        xpath: '//*/p[@class="vacancy-creation-time-redesigned"]',
        type: XPathResult.STRING_TYPE,
      },
      archived: {
        xpath: '//*/div[@data-qa="vacancy-title-archived-text"]',
        type: XPathResult.STRING_TYPE,
      },
    },
    company: {
      name: {
        xpath: '//*/h1[@data-qa="title"]',
        type: XPathResult.STRING_TYPE,
      },
      url: {
        xpath: '//*/span[@data-qa="sidebar-company-site-text"]',
        type: XPathResult.STRING_TYPE,
      },
      location: {
        xpath: '//*/div[@data-qa="company-info-address"]//*/div[contains(@class, "magritte-wrapper")][1]//*/span[@data-qa="cell-text-content"]',
        type: XPathResult.STRING_TYPE,
      },
      description: {
        xpath: '//*/div[@class="g-user-content"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      descriptionBrandedV1: {
        xpath: '//*/div[contains(@class, "employer-branded")]//div[@class="tmpl_hh_wrapper"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      descriptionBrandedV2: {
        xpath: '//*/div[contains(@class, "employer-branded")]//div[@class="tmpl-hh-brand-container"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      ratingDreamjob: {
        xpath: '//*/div[contains(@class, "EmployerReviewsFront")]/div/div/div/div/div/div/div/div[1]/div/div/div/div[1]',
        type: XPathResult.STRING_TYPE,
      },
    },
  },
  linkedin: {
    vacancy: {
      name: {
        xpath: '//*/h1/text()',
        type: XPathResult.STRING_TYPE,
      },
      salary: {
        xpath: '//*/h3[@class="compensation__heading"]/following-sibling::div[contains(@class, "compensation")]/text()',
        type: XPathResult.STRING_TYPE,
      },
      timeType: {
        xpath: '//*/ul[@class="description__job-criteria-list"]/li[2]/span',
        type: XPathResult.STRING_TYPE,
      },
      companyName: {
        xpath: '//*/span[@class="topcard__flavor"]',
        type: XPathResult.STRING_TYPE,
      },
      companyUrl: {
        xpath: '//*/span[@class="topcard__flavor"][1]/a/@href',
        type: XPathResult.STRING_TYPE,
      },
      head: {
        xpath: '//*/div[contains(@class, "top-card-layout__card")]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      body: {
        xpath: '//*/div[@class="decorated-job-posting__details"]',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
      address: {
        xpath: '//*/span[@class="topcard__flavor topcard__flavor--bullet"]/text()',
        type: XPathResult.STRING_TYPE,
      },
      published: {
        xpath: '//*/span[contains(@class, "posted-time-ago")]/text()',
        type: XPathResult.STRING_TYPE,
      },
    },
    company: {
      name: {
        xpath: '//*/h1/text()',
        type: XPathResult.STRING_TYPE,
      },
      url: {
        xpath: '//*/a[@data-tracking-control-name="about_website"]/@href',
        type: XPathResult.STRING_TYPE,
      },
      location: {
        xpath: '//*/h3[contains(@class, "top-card-layout__first-subline")]/text()[1]',
        type: XPathResult.STRING_TYPE,
      },
      description: {
        xpath: '//*/div[contains(@class, "core-section-container__content")]/p[contains(@class, "break-words")]/text()',
        type: XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      },
    },
  },
}

const ANALYTICS_RULES = {
  hh: {
    url: 'https://hh.ru/search/vacancy?text={$headline}&search_field=name&excluded_text=&salary=&salary=&salary_mode=&currency_code=RUR&experience=doesNotMatter&order_by=relevance&search_period=0&items_on_page=50&L_save_area=true&hhtmFrom=vacancy_search_filter',
    replacer: '{$headline}',
    xpath: '//*/h1[@data-qa="title"]',
    type: XPathResult.STRING_TYPE,
  },
  linkedin: {
    url: 'https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords={$headline}&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true',
    replacer: '{$headline}',
    xpath: '//*/h1',
    type: XPathResult.STRING_TYPE,
	// # russia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4266159978&geoId=101728296&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_LOCATION_AUTOCOMPLETE&refresh=true

	// # united states
	// # https://www.linkedin.com/jobs/search/?currentJobId=4282419315&geoId=103644278&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # canada
	// # https://www.linkedin.com/jobs/search/?currentJobId=4219897401&geoId=101174742&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # eurasia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # european union
	// # https://www.linkedin.com/jobs/search/?currentJobId=4270271974&geoId=91000000&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # netherlands
	// # https://www.linkedin.com/jobs/search/?currentJobId=4280124242&geoId=102890719&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # united kingdom
	// # https://www.linkedin.com/jobs/search/?currentJobId=4271864680&geoId=101165590&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # germany
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278238645&geoId=101282230&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # spain
	// # https://www.linkedin.com/jobs/search/?currentJobId=4281490999&geoId=105646813&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # portugal
	// # https://www.linkedin.com/jobs/search/?currentJobId=4261113369&geoId=100364837&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # cyprus
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278333385&geoId=106774002&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # georgia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278329763&geoId=106315325&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # armenia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278329770&geoId=103030111&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # latin america
	// # https://www.linkedin.com/jobs/search/?currentJobId=4270514484&geoId=91000011&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # south asia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4143880596&geoId=91000013&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # southeast asia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4269126376&geoId=91000014&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # east asia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4267645152&geoId=91000012&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # kyrgyzstan
	// # https://www.linkedin.com/jobs/search/?currentJobId=4275382913&geoId=103490790&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # kazakhstan
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278327882&geoId=106049128&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # united arab emirates (uae)
	// # https://www.linkedin.com/jobs/search/?currentJobId=4281931860&geoId=104305776&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # australia
	// # https://www.linkedin.com/jobs/search/?currentJobId=4277140431&geoId=101452733&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # new zealand
	// # https://www.linkedin.com/jobs/search/?currentJobId=4278957985&geoId=105490917&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// # australia and new zealand
	// # https://www.linkedin.com/jobs/search/?currentJobId=4277140431&geoId=91000015&keywords=qa%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true

	// http -b GET "https://www.linkedin.com/jobs/search/?currentJobId=4223707724&geoId=91000025&keywords=$title&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true" | tr -d '\n' | grep -oP '<h1 class="results-context-header__context">.*</h1>' | grep -oP '<span class="results-context-header__job-count">[^<]+|<span class="results-context-header__query-search">[^<]+' | sed -e 'N;s/\n/: /;s/<[^>]*>//g;s/.*span.//'
  },
}

module.exports = {
  RULES,
  ANALYTICS_RULES,
}
