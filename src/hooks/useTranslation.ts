import { useMemo, useReducer, useState } from "react"
import useLocalize from "./useLocalize"
import { TranslationPaths } from "@src/languages/types"

export default function useTranslation() {
    const [phrase, setPhrase] = useState<TranslationPaths | undefined>()
    const { translate } = useLocalize()
    const translation = useMemo(() => {
        try {
            if (!phrase) return undefined
            
                return translate(phrase)
        }catch (e) {
            return undefined 
        }
    }, [translate])
    return {translation, setPhrase}
}
type MultipleTranslationsDefiniton = { [key: string]: TranslationPaths | undefined }
type MultipleTranslationsState<T = MultipleTranslationsDefiniton> = {
    [K in keyof T]: TranslationPaths | undefined
}

type MultipleTranslationsAction<TState = MultipleTranslationsState> = {
    [K in keyof TState]: {
        type: K;
        payload: TranslationPaths | undefined
    };
}[keyof TState];

const translationObject: MultipleTranslationsState = {
    formError: "common.pleaseEnterEmailOrPhoneNumber",
    loginForm: "loginForm.loginForm",
};

export function useMultipleTranslations<
    TState extends MultipleTranslationsState = MultipleTranslationsState,
    TAction extends MultipleTranslationsAction<TState> = MultipleTranslationsAction<TState>
>(initalState: TState) {
    const { translate } = useLocalize();

    const reducer = (state: TState, action: TAction): TState => {
        return { ...state, [action.type]: action.payload }
    };
    const translateState = (state: TState) => {
        return Object.entries(state).reduce((translations, [key, phrase]) => {
            try {
                if (!phrase) return {
                    ...translations,
                    [key]: undefined
                };
                return {
                    ...translations,
                    [key]: translate(phrase)
                }
            } catch (e) {
                return {
                    ...translations,
                    [key]: undefined
               }
            }
        }, state)
    };

    const [state, dispatch] = useReducer(reducer, translateState(initalState));

    const translations = useMemo(() => {
        return translateState(state);
    }, [translate, state]);

    return { translations, dispatch };
}