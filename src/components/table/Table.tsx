import {
    ArrowLongLeftIcon,
    ArrowLongRightIcon,
} from '@heroicons/react/16/solid';
import RedireactButton from '../UI/RedireactButton';
import type { Client } from '../../types/Client';
import type { EmployeePayment } from '../../types/EmployeePayment';


type TableInfoType = {
    [key: string]: string;
};

type TableProps = {
    items: ClientTypes | EmployeePayment;
    tableInfo: TableInfoType | EmployeePayment[];
    onView?: () => void;
    selectedItem?: React.Dispatch<React.SetStateAction<| Client>>;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
    redirectTo?: string;
    title: string;
    totalPages: number;
    children?: React.ReactNode;
    action: boolean
};
const getPages = (total: number, page: number) => {
    let pages: (number | string)[] = [];
    if (total <= 5) {
        pages = Array.from({ length: total }, (_, i) => i + 1);
    } else if (page <= 3) {
        pages = [1, 2, 3, '...', total];
    } else if (page >= total - 2) {
        pages = [1, '...', total - 2, total - 1, total];
    } else {
        pages = [1, '...', page - 1, page, page + 1, '...', total];
    }

    return pages;
};

export default function Table({
    items,
    tableInfo,
    onView,
    selectedItem,
    page,
    setPage,
    redirectTo,
    totalPages,
    children,
    action
}: TableProps) {
    return (
        <div className="px-4 sm:px-6 lg:px-8">

            {children}
            {items.length === 0 ? (<p className="m-10 text-sm text-center text-gray-500">
                There is no data yet
            </p>) : (<div className="-mx-4 mt-10 ring-0 sm:mx-0 sm:rounded-lg ">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            {Object.keys(tableInfo).map((keyValue: string) => {
                                return (
                                    <th
                                        key={keyValue}
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold
                     text-second "
                                    >
                                        {keyValue}
                                    </th>
                                );
                            })}

                            {action && (
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Select</span>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id + index}>
                                {Object.values(tableInfo).map((value: string) => {
                                    let content = '';
                                    if (
                                        typeof item[value] == 'object' &&
                                        Array.isArray(item[value])
                                    ) {
                                        content = item[value].map((i) => `${i}`).join(',');
                                    } else {
                                        content = item[value];
                                    }
                                    return (
                                        <td
                                            key={item.id}
                                            className=" px-3 py-3.5 text-sm text-left text-gray-500 border-t"
                                        >
                                            {content}
                                        </td>
                                    );
                                })}
                                {action && (< td className="px-3 flex justify-end py-3.5 text-sm text-gray-500  border-t ">
                                    <RedireactButton
                                        onClick={() => {
                                            selectedItem(item);
                                            onView();
                                        }}
                                        to={onView ? undefined : `/${redirectTo}/${item.id}`}
                                        text="Ver mas"
                                        type="second"
                                        withArrow
                                    />
                                    {index === 0 ? (
                                        <div className="absolute -top-px left-0 right-6 h-px bg-gray-200" />
                                    ) : null}
                                </td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>)
            }
            <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
                <div className="-mt-px flex w-0 flex-1">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        <ArrowLongLeftIcon
                            aria-hidden="true"
                            className="mr-3 h-5 w-5 text-gray-400"
                        />
                        Previous
                    </button>
                </div>
                <div className="hidden md:-mt-px md:flex">
                    {/* pagination */}
                    {getPages(totalPages, page).map((p, index) =>
                        typeof p === 'number' ? (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`inline-flex items-center border-t-2 pl-1 pt-4 text-sm font-medium 
        ${p === page
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                {p}
                            </button>
                        ) : (
                            <span
                                key={`ellipsis-${index}`}
                                className=" inline-flex items-center px-4 pt-4 text-sm text-gray-500"
                            >
                                {p}
                            </span>
                        )
                    )}
                </div>
                <div className="-mt-px flex w-0 flex-1 justify-end">
                    <button
                        onClick={() =>
                            setPage((prev) => (prev < totalPages ? prev + 1 : prev))
                        }
                        className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                        Next
                        <ArrowLongRightIcon
                            aria-hidden="true"
                            className="ml-3 h-5 w-5 text-gray-400"
                        />
                    </button>
                </div>
            </nav>
        </div >
    );
}
