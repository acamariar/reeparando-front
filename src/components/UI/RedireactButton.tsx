import { NavLink } from 'react-router-dom';
import getClassNames from '../../utils/class-handler';


type RedireactButtonProps = {
    to: string | undefined;
    text: string;
    type: string;
    withArrow: boolean;
    onClick?: (() => void) | undefined;
};

const firstStyle =
    'inline-flex rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
const secondStyle =
    'inline-flex items-center bg-secondary rounded-md  px-4 py-3 text-sm font-semibold text-white shadow-sm  hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white';
export default function RedireactButton({
    to,
    text,
    type,
    withArrow,
    onClick,
}: RedireactButtonProps) {
    return (
        <NavLink to={to}>
            <button
                onClick={onClick}
                type="button"
                className={getClassNames(type === 'first' ? firstStyle : secondStyle)}
            >
                {text}
                {withArrow && (
                    <svg
                        className="rtl:rotate-180 w-3.5 h-3.5 ms-2 "
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                    >
                        <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                    </svg>
                )}
            </button>
        </NavLink>
    );
}