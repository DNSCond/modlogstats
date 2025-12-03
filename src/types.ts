import { type ModActionType } from "@devvit/public-api";

export type CustomModActionTypes = 'Favicond_Modmail' | 'Favicond_Modmail_Reply'
    | 'Favicond_Modmail_Admin' | 'Favicond_Modmail_Admin_Reply' |
    'Favicond_Modmail_Incoming_Initial' | 'Favicond_Modmail_Incoming_Reply';
export type CombinedModActionTypes = CustomModActionTypes | ModActionType;

/**
 * the currently used incomming modmail to save.
 */
export type incommingModMailEntry2 = {
    /**
     * the username of the moderator if one is speaking, or `'[Favicond_anonymous]'` if no moderator is speaking.
     */
    moderatorUsername: string | '[Favicond_anonymous]',
    /**
     * the username of the speaker, always defined.
     */
    mailerUsername: string,
    /**
     * the username in which modmail is supposed to speaking to, or null if there isnt one
     */
    affectedUsername: string | null,
    /**
     * truthy if the user is an admin speaking. falsey if not.
     */
    isAdmin: boolean,
    /**
     * truthy if the user is an moderator speaking. falsey if not.
     */
    isMod: boolean,
    /**
     * one of the following
     * 
     * - `'mail'`: a message sent in modmail.
     * - `'archive'`: a mod archives the modmail.
     * - `'mute'`: the `affectedUser`name is muted by the mods.
     * - `'internal'`: a private moderator note.
     */
    mailActionType: 'mail' | 'archive' | 'mute' | 'internal',
    /**
     * compatibillity
     */
    type: CombinedModActionTypes,
    /**
     * if this message is a reply.
     */
    isReply: boolean,
    /**
     * when the modmail is sent.
     */
    date: Date,
    /**
     * the discriminator, if the type updates use a different discriminator.
     */
    actionEntryType: 'modmailV2',
    /** type of conversation (oneOf the following): `internal` (mod discussion), `sr_user`
     *  (between a subreddit and user), `sr_sr` (between two subreddits), or `string` if reddit decides to update it */
    toWho: 'sr_sr' | 'sr_user' | 'internal' | string,
};

export type ModActionEntry2 = {
    /**
     * the moderator username.
     */
    moderatorUsername: string,
    /**
     * if a string does not start with "Favicond_" its a reddit action, if it does its defined here.
     * 
     * - `Favicond_Modmail`: Moderator-initiated modmail messages.
     * - `Favicond_Modmail_Reply`: Moderator replies in modmail conversations.
     * - `Favicond_Modmail_Admin`: Admin-initiated modmail messages.
     * - `Favicond_Modmail_Admin_Reply`: Admin replies in modmail conversations.
     * - `Favicond_Modmail_Incoming_Initial`: First modmail message from a non-moderator.
     * - `Favicond_Modmail_Incoming_Reply`: Non-moderator replies in ongoing modmail conversations.
     */
    type: CombinedModActionTypes,
    /**
     * when the modlog is logged.
     */
    date: Date,
    /**
     * the username who is affected by the action, or [nullish](https://developer.mozilla.org/en-US/docs/Glossary/Nullish) if there isnt one.
     */
    affectedUsername?: string | null,
    /**
     * the discriminator, if the type updates use a different discriminator.
     */
    actionEntryType: 'modlog2',
}

/**
 * a legacy type
 */
export type incommingModMailEntry = {
    moderatorUsername: string | '[Favicond_anonymous]',
    mailerUsername: string, affectedUsername?: null,
    isAdmin?: boolean, isMod?: boolean,
    type: string, date: Date,
    actionEntryType?: undefined,
};

/**
 * a legacy type
 */
export type ModActionEntry = {
    moderatorUsername: string,
    type: string, date: Date,
    affectedUsername?: string | null,
    actionEntryType?: undefined,
} | incommingModMailEntry | incommingModMailEntry2 | ModActionEntry2;
