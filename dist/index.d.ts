declare global {
    interface Window {
        parseDate: (dateString: string) => number;
    }
}
export {};
