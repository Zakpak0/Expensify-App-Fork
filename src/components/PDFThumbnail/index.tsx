import pdfWorkerSource from 'pdfjs-dist/legacy/build/pdf.worker';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Document, pdfjs, Thumbnail} from 'react-pdf';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useThemeStyles from '@hooks/useThemeStyles';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import PDFThumbnailError from './PDFThumbnailError';
import type PDFThumbnailProps from './types';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSource], {type: 'text/javascript'}));
}

function PDFThumbnail({previewSourceURL, style, isAuthTokenRequired = false, enabled = true, onPassword, onLoadError}: PDFThumbnailProps) {
    const styles = useThemeStyles();
    const [failedToLoad, setFailedToLoad] = useState(false);

    const thumbnail = useMemo(
        () => (
            <Document
                loading={<FullScreenLoadingIndicator />}
                file={isAuthTokenRequired ? addEncryptedAuthTokenToURL(previewSourceURL) : previewSourceURL}
                options={{
                    cMapUrl: 'cmaps/',
                    cMapPacked: true,
                }}
                externalLinkTarget="_blank"
                onPassword={onPassword}
                onLoad={() => {
                    setFailedToLoad(false);
                }}
                onLoadError={() => {
                    if (onLoadError) {
                        onLoadError();
                    }
                    setFailedToLoad(true);
                }}
                error={() => null}
            >
                <View pointerEvents="none">
                    <Thumbnail pageIndex={0} />
                </View>
            </Document>
        ),
        [isAuthTokenRequired, previewSourceURL, onPassword, onLoadError],
    );

    return (
        <View style={[style, styles.h100, styles.overflowHidden]}>
            <View style={[styles.w100, styles.h100, !failedToLoad && {...styles.alignItemsCenter, ...styles.justifyContentCenter}]}>
                {enabled && failedToLoad && thumbnail}
                {failedToLoad && <PDFThumbnailError />}
            </View>
        </View>
    );
}

PDFThumbnail.displayName = 'PDFThumbnail';
export default React.memo(PDFThumbnail);
