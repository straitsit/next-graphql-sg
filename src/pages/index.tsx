import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Q_REG_FIELDS, Q_REG_VALUES } from '../constants/gql';
import { Fragment } from 'react';
import Image from 'next/image'
import MultiSelect from 'react-multi-select-component';
import COUNTRY_LIST from '../constants/country_names';
import LoginLayout from '../components/PageLayout';
import ReadMoreModal from '../components/ReadMoreModal';

const IndexPage = props => {
  const [lazyStart, setLazyStart] = useState(false);
  const [readMoreText, setReadMoreText] = useState(null);

  const [regCountries, setRegCountries] = useState([]);
  const [totalCountries, setTotalCountries] = useState([]);
  const [regFields, setRegFields] = useState([]);
  const [totalFields, setTotalFields] = useState([]);

  const [fieldParams, setFieldParams] = useState({ sort: "id", limit: 70, start: 0 });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [titleOptions, setTitleOptions] = useState([]);

  const [selectedCategories, setCategorySelect] = useState([]);
  const [selectedCountries, setCountrySelect] = useState([]);
  const [selectedTitles, setTitleSelect] = useState([]);

  const { loading, error, data: fields } = useQuery(Q_REG_FIELDS, { variables: fieldParams });
  const { refetch: fetchValues } = useQuery(Q_REG_VALUES);

  useEffect(() => {
    regFieldsFilter();
  }, [selectedCategories, selectedCountries, selectedTitles, totalFields, totalCountries]);

  useEffect(() => {
    setTitleSelect(titleOptions);
  }, [titleOptions]);

  useEffect(() => {
    if (totalFields.length != 0) {
      titleOptionFilter();
    }
  }, [selectedCategories, totalFields]);

  const titleOptionFilter = () => {
    let titles = [];
    let categories = selectedCategories.map(cat => cat.value);
    totalFields.forEach(field => {
      if (categories.includes(field.category)) {
        field.features.forEach(feature => {
          titles.push({ label: feature.title, value: feature.title });
        });
      }
    });
    setTitleOptions(titles);
  }

  const regFieldsFilter = () => {
    // Filter by category
    let selectedCategoriesList = selectedCategories.map(cat => cat.value);
    let filtered = totalFields.filter(field => selectedCategoriesList.includes(field.category));

    // Filter by title
    let filtered_new = [];
    let selectedTitleList = selectedTitles.map(title => title.value);
    filtered.forEach(item => {
      let features = item.features.filter(feature => selectedTitleList.includes(feature.title));
      let item_new = Object.assign({}, item);
      item_new.features = features;
      filtered_new.push(item_new);
    });

    setRegFields(filtered_new);

    // Filter by country
    let selectedCountryList = selectedCountries.map(country => country.value);
    let countries = totalCountries.filter(country => selectedCountryList.includes(country.name));
    setRegCountries(countries);
  }

  const getRegValues = async (fields) => {
    let payload = []

    for (let i = 0; i < fields.length; i++) {
      try {
        let regValues = await fetchValues({ obj: fields[i].id });

        let value_array = regValues.data.regValues;
        let value_json = {};
        value_array.forEach(element => {
          value_json[element.country] = element.value;
        });

        let item = { ...fields[i], regValues: value_json }
        payload.push(item);
      } catch (err) {
        console.log(err);
      }

      // Set countries
      let countries = [];
      Object.keys(payload[0].regValues).forEach(key => {
        countries.push({ name: key, href: '/images/' + key + '.png' });
      });
      setRegCountries(countries);
      setTotalCountries(countries);

      // Set country multi options
      const country_options = countries.map(country => { return { label: COUNTRY_LIST[country.name], value: country.name } });
      setCountryOptions(country_options);
      setCountrySelect(country_options.slice(0, 4));

      // Set categories multi options
      let categories = [];
      fields.forEach(field => { categories.push(field.category); });
      categories = Array.from(new Set(categories));
      setCategoryOptions(categories.map(category => { return { label: category, value: category } }));
      setCategorySelect(categories.map(category => { return { label: category, value: category } }));

      // Set Titles multi options
      let titles = [];
      fields.forEach(field => { titles.push(field.title); });
      titles = Array.from(new Set(titles));
      setTitleOptions(titles.map(title => { return { label: title, value: title } }));
      setTitleSelect(titles.map(title => { return { label: title, value: title } }));

      // Construct regFields
      let regFields = [];
      categories.forEach(category => {
        let aField = { category: category, features: [] };
        aField.features = payload.filter(item => item.category == category);
        regFields.push(aField);
      });
      setRegFields(regFields);
      setTotalFields(regFields);
    }

  }

  const setCountrySelectC = (items) => {
    if (items.length > 4) return;
    setCountrySelect(items);
  }

  if (!loading && !error && !lazyStart) {
    setLazyStart(true);
    getRegValues(fields.regFields);
  }

  return (
    <LoginLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="py-8 lg:pt-0 text-2xl text-white">Regulations Map</h1>

        <section aria-labelledby="profile-overview-title">
          <div className="rounded-lg bg-white overflow-hidden shadow">


            <div className="bg-white">
              <div className="max-w-7xl mx-auto bg-white py-16 sm:py-24 sm:px-6 lg:px-8">
                <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-1 mb-9 md:grid-cols-3 px-4">
                  <div>
                    <label htmlFor="">Country</label>
                    <MultiSelect className="w-full" options={countryOptions} value={selectedCountries} onChange={setCountrySelectC} labelledBy="Select" hasSelectAll={false} overrideStrings={{ search: 'Search... (Select Maxmimum 4)' }} />
                  </div>
                  <div>
                    <label htmlFor="">Category</label>
                    <MultiSelect className="w-full" options={categoryOptions} value={selectedCategories} onChange={setCategorySelect} labelledBy="Select" />
                  </div>
                  <div>
                    <label htmlFor="">Title</label>
                    <MultiSelect className="w-full" options={titleOptions} value={selectedTitles} onChange={setTitleSelect} labelledBy="Select" />
                  </div>
                </div>
                {
                  totalFields.length != 0 && <>
                    <div className="max-w-2xl mx-auto space-y-16 lg:hidden">
                      {regCountries.map((regVal, regValIdx) => (
                        <section key={regVal.name}>
                          <div className="px-4 mb-8">
                            <h2 className="text-lg leading-6 font-medium text-gray-900 text-center">
                              <a
                                href={regVal.href}
                                className="bottom-0 flex-grow block w-full rounded-md 5 py-2 text-sm font-semibold text-white"
                              >
                                <Image src={regVal.href} alt="Flag" width="64" height="64" />
                              </a>
                              {COUNTRY_LIST[regVal.name]}
                            </h2>
                          </div>
                          {regFields.map((section) => (
                            <table key={section.category} className="w-full">
                              <caption className="bg-gray-50 border-t border-gray-200 py-3 px-4 text-sm font-medium text-gray-900 text-left">
                                {section.category}
                              </caption>
                              <thead>
                                <tr>
                                  <th className="sr-only" scope="col">
                                    Feature
                                                    </th>
                                  <th className="sr-only" scope="col">
                                    Included
                                                    </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {section.features.map((feature) => (
                                  <tr key={feature.title} className="border-t border-gray-200">
                                    <th className="py-5 px-4 text-sm font-normal text-gray-500 text-left" scope="row">
                                      {feature.title}
                                    </th>
                                    <td className="py-5 pr-4">
                                      <span className="block text-sm text-gray-700 text-right">{feature.regValues[regVal.name]}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ))}
                        </section>
                      ))}
                    </div>

                    <div className="hidden lg:block">
                      <table className="w-full h-px border-collapse table-fixed">
                        <caption className="sr-only">Pricing plan comparison</caption>
                        <thead>
                          <tr>
                            <th className="w-48 pb-4 px-6 text-sm font-medium text-gray-900 text-сутеук border border-gray-200" scope="col">
                              <span className="sr-only">Feature by</span>
                              <span>Country</span>
                            </th>
                            {regCountries.map((regVal) => (
                              <th
                                key={regVal.name}
                                className="pb-4 px-9 text-lg leading-6 font-medium text-gray-900 text-center border border-gray-200 w-auto"
                                scope="col"
                              >
                                <a
                                  href={regVal.href}
                                  className="bottom-0 flex-grow block w-full rounded-md 5 py-2 text-sm font-semibold text-white text-center"
                                >
                                  <Image src={regVal.href} alt="Flag" width="64" height="64" />
                                </a>
                                {COUNTRY_LIST[regVal.name]}

                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="border-t border-gray-200 divide-y divide-gray-200">
                          {regFields.map((section) => (
                            <Fragment key={section.category}>
                              <tr>
                                <th
                                  className="bg-gray-50 py-3 pl-6 text-sm font-medium text-gray-900 text-center border border-gray-200"
                                  colSpan={regCountries.length + 1}
                                  scope="colgroup"
                                >
                                  {section.category}
                                </th>
                              </tr>
                              {section.features.map((feature) => (
                                <tr key={feature.title}>
                                  <th className="py-1 text-md font-normal text-gray-500 text-center border border-gray-200" scope="row">
                                    {feature.title}
                                  </th>
                                  {regCountries.map((regVal) => (
                                    <td key={regVal.name} className="py-1 px-1 border border-gray-200">
                                      <span className="block text-sm text-gray-700 max-h-29 overflow-y-auto cell-scrollbar overflow-x-hidden overflow-ellipsis">
                                        {feature.regValues[regVal.name] && feature.regValues[regVal.name].slice(0, 150)}
                                        {
                                          feature.regValues[regVal.name] && feature.regValues[regVal.name].length > 150 && <>
                                            <div className="text-blue-600 text-right" onClick={() => setReadMoreText(feature.regValues[regVal.name])}>Read More</div>
                                          </>
                                        }
                                      </span>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </Fragment>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200">
                            <th className="sr-only" scope="row">
                              Choose your plan
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                }
              </div>
            </div>
            {
              totalFields.length == 0 && <h1>Loading...</h1>
            }
            <ReadMoreModal readMoreText={readMoreText} setReadMoreText={setReadMoreText} />
          </div>
        </section>


      </div>
    </LoginLayout>
  )
}

export default IndexPage;
