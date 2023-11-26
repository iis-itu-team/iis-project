export enum Visibility {
    PRIVATE = "private",
    PROTECTED = "protected",
    PUBLIC = "public"
}

export const groupVisibilityRadioOptions = [
    {
        value: 'private',
        text: 'Private',
        description: 'No one can see inside your group.'
    },
    {
        value: 'protected',
        text: 'Protected',
        description: 'Only registered users can see inside your group.'
    },
    {
        value: 'public',
        text: 'Public',
        description: 'Anyone can see inside your group.'
    }
];
