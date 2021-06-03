import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Q_REG_FIELDS, Q_REG_VALUES } from '../constants/gql';
import { Fragment } from 'react';
import Image from 'next/image'
import MultiSelect from 'react-multi-select-component';

const IndexPage = props => {
    const [lazyStart, setLazyStart] = useState(false);
    const [regCountries, setRegCountries] = useState([]);
    const [totalCountries, setTotalCountries] = useState([]);
    const [regFields, setRegFields] = useState([]);
    const [totalFields, setTotalFields] = useState([]);

    const [fieldParams, setFieldParams] = useState({ sort: "id", limit: 1, start: 0 });

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
        }

        // Set countries
        let countries = [];
        Object.keys(payload[0].regValues).forEach(key => {
            countries.push({ name: key, href: '/images/' + key + '.png' });
        });
        setRegCountries(countries);
        setTotalCountries(countries);

        // Set country multi options
        setCountryOptions(countries.map(country => { return { label: country.name, value: country.name } }));
        setCountrySelect(countries.map(country => { return { label: country.name, value: country.name } }));

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

    if (!loading && !error && !lazyStart) {
        setLazyStart(true);
        console.log('[fields]', fields);
        getRegValues(fields.regFields);
    }

    return (
        <div className="container mx-auto">
            <div className="text-4xl mx-9 mt-9">First Report Page</div>

            {
                totalFields.length != 0 &&
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto bg-white py-16 sm:py-24 sm:px-6 lg:px-8">
                        <div className="grid gap-4 xs:grid-cols-1 sm:grid-cols-1 mb-9 md:grid-cols-3 px-4">
                            <div>
                                <label htmlFor="">Category</label>
                                <MultiSelect className="w-full" options={categoryOptions} value={selectedCategories} onChange={setCategorySelect} labelledBy="Select" />
                            </div>
                            <div>
                                <label htmlFor="">Country</label>
                                <MultiSelect className="w-full" options={countryOptions} value={selectedCountries} onChange={setCountrySelect} labelledBy="Select" />
                            </div>
                            <div>
                                <label htmlFor="">Title</label>
                                <MultiSelect className="w-full" options={titleOptions} value={selectedTitles} onChange={setTitleSelect} labelledBy="Select" />
                            </div>
                        </div>
                        {/* xs to lg */}
                        <div className="max-w-2xl mx-auto space-y-16 lg:hidden">
                            {regCountries.map((regVal, regValIdx) => (
                                <section key={regVal.name}>
                                    <div className="px-4 mb-8">
                                        <h2 className="text-lg leading-6 font-medium text-gray-900">{regVal.name}</h2>
                                        <div className="mt-4">
                                            <span className="text-base font-medium text-gray-500">
                                                <a
                                                    href={regVal.href}
                                                    className=""
                                                >
                                                    <Image src={regVal.href} alt="Flag" width="64" height="64" />
                                                </a>
                                            </span>
                                        </div>
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
                                                            {typeof feature.regValues[regVal.name] === 'string' ? (
                                                                <span className="block text-sm text-gray-700 text-right">{feature.regValues[regVal.name]}</span>
                                                            ) : (
                                                                <>
                                                                    <span className="sr-only">{feature.regValues[regVal.name] === true ? 'Yes' : 'No'}</span>
                                                                </>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ))}
                                </section>
                            ))}
                        </div>

                        {/* lg+ */}
                        <div className="hidden lg:block overflow-auto">
                            <table className="w-full h-px">
                                <caption className="sr-only">Pricing plan comparison</caption>
                                <thead>
                                    <tr>
                                        <th className="w-1/4 pb-4 px-6 text-sm font-medium text-gray-900 text-left" scope="col">
                                            <span className="sr-only">Feature by</span>
                                            <span>Country</span>
                                        </th>
                                        {regCountries.map((regVal) => (
                                            <th
                                                key={regVal.name}
                                                className="pb-4 px-9 text-lg leading-6 font-medium text-gray-900 text-center"
                                                scope="col"
                                            >
                                                {regVal.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="border-t border-gray-200 divide-y divide-gray-200">
                                    <tr>
                                        <th className="py-8 px-6 text-sm font-medium text-gray-900 text-left align-top" scope="row">
                                            Flag
                </th>
                                        {regCountries.map((regVal) => (
                                            <td key={regVal.name} className="h-full py-1 px-1 align-top">
                                                <div className="relative h-full table w-full">

                                                    <a
                                                        href={regVal.href}
                                                        className="absolute bottom-0 flex-grow block w-full h-full rounded-md 5 py-2 text-sm font-semibold text-white text-center"
                                                    >
                                                        <Image src={regVal.href} alt="Flag" width="64" height="64" />
                                                    </a>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                    {regFields.map((section) => (
                                        <Fragment key={section.category}>
                                            <tr>
                                                <th
                                                    className="bg-gray-50 py-3 pl-6 text-sm font-medium text-gray-900 text-left"
                                                    colSpan={regCountries.length + 1}
                                                    scope="colgroup"
                                                >
                                                    {section.category}
                                                </th>
                                            </tr>
                                            {section.features.map((feature) => (
                                                <tr key={feature.title}>
                                                    <th className="py-5 text-sm font-normal text-gray-500 text-left" scope="row">
                                                        {feature.title}
                                                    </th>
                                                    {regCountries.map((regVal) => (
                                                        <td key={regVal.name} className="py-5 px-1">
                                                            <span className="block text-sm text-gray-700">
                                                                <input readOnly className="w-full" type="text" value={feature.regValues[regVal.name]} />
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
                    </div>
                </div>
            }
            {/* {
        regData.length != 0 &&
        <div className="w-full overflow-auto max-h-96">
          <table className="table-auto w-full border border-green-800 mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-0.5">Title</th>
                <th className="border border-gray-200 p-0.5">Category</th>
                <th className="border border-gray-200 p-0.5">Generic</th>
                {
                  Object.keys(regData[0].values).map((key, index) => (
                    <th className="border border-gray-200 p-0.5" key={index}>{key}</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {
                regData.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-0.5"><input readOnly value={item.title} /></td>
                    <td className="border border-gray-200 p-0.5"><input readOnly value={item.category} /></td>
                    <td className="border border-gray-200 p-0.5"></td>
                    {Object.keys(regData[0].values).map((key1, index1) => (
                      <td key={index1} className="border border-gray-200 p-0.5"><input readOnly value={item.values[key1]} /></td>
                    ))}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      } */}
            {
                totalFields.length == 0 && <h1>Loading...</h1>
            }

        </div>
    )
}

export default IndexPage;
