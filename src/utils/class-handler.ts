export default function getClassNames(...classes: Array<string | false | null | undefined>): string {
    return classes.filter(Boolean).join(' ');
}
