export const UniqueId = "TSWM";

export type MessageObj<T> = {
    [K in keyof T]: (...args: any) => void;
};

export type MessageType = {
    from: typeof UniqueId;
    type: "message" | "callback";
    name: string;
    payload: any;
    cbId: string;
};
