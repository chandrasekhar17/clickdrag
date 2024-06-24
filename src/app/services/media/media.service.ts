import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ScramblerService } from '../scrambler/scrambler.service';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  mediaLoaded = false;
  mediaLoaded$ = new Subject<any>();
  mediaList = [];
  itemMedia;
  mediaBase;
  mediaUrls;
  mediaDomain;
  itemmediaReceived = false;
  itemmediaResponse;

  constructor(private http: HttpClient, private scrambler: ScramblerService) {
    this.mediaBase = EZ.mediaBase.toString();
    this.mediaUrls = EZ.mediaUrls;
    this.mediaDomain = this.mediaBase.substring(0, this.mediaBase.indexOf('.com') + 4);
    if (false && this.mediaBase !== undefined && this.mediaUrls !== undefined) {
      this.mediaUrls.forEach((media) => {
        const extIndex = media.lastIndexOf('.');
        const ext = media.slice(extIndex + 1);
        if (ext !== '') {
          let mediaType;
          let icon;
          if (/jpg|png|gif|jpeg/i.test(ext)) {
            mediaType = 'image';
            icon = 'dpg-icon-image';
          }
          if (/wav|mp3|mp4|ogg/i.test(ext)) {
            mediaType = 'audio';
            icon = 'dpg-icon-av-control-play-outline';
          }
          if (mediaType !== undefined && mediaType === 'image') {
            this.mediaList.push({
              mediaId: media,
              type: mediaType,
              title: media,
              path: this.mediaBase + media,
              altText: '',
              description: '',
              thumbnail: '',
              caption: '',
              transcript: '',
              icon: icon,
              isItemMedia: false,
            });
          }
        }
      });
    }

    let fetchItemMedia = true;
    if (EZ.mode !== EZ.MODE_DESIGN) {
      const state = JSON.parse(this.scrambler.unscramble(EZ.state));
      const isMediaUsed = this.isMediaUsed(state);
      if (!isMediaUsed) {
        fetchItemMedia = false;
      }
    }

    if (fetchItemMedia && EZ.itemmedia !== undefined && typeof EZ.itemmedia === 'function') {
      // this.http
      //   .get(EZ.itemmedia, { headers: { Authorization: EZ.itemmediaJWT }, responseType: 'json' })
      //   .subscribe((response: any) => {
      try {
        const responsePromise = EZ.itemmedia();
        responsePromise.then((response) => {
          console.log('itemmedia:', response);
          this.itemmediaResponse = response;
          this.itemmediaReceived = true;
          for (let mediaId in response.media) {
            let media = response.media[mediaId];
            let mediaDetails = media.assets['en-us'];
            let mediaType;
            let icon;
            if (/image/i.test(media.mediaType)) {
              mediaType = 'image';
              icon = 'dpg-icon-image';
            } else if (/audio/i.test(media.mediaType)) {
              mediaType = 'audio';
              icon = 'dpg-icon-av-control-play-outline';
            }
            const mediaObj = {
              mediaId: mediaId,
              type: mediaType,
              title: mediaDetails.filename,
              path: mediaDetails.primary,
              altText: mediaDetails.alt_text === undefined ? '' : mediaDetails.alt_text,
              description: mediaDetails.long_description === undefined ? '' : mediaDetails.long_description,
              thumbnail: mediaDetails.thumbnail,
              caption: mediaDetails.caption === undefined ? '' : mediaDetails.caption,
              transcript: mediaDetails.transcript === undefined ? '' : mediaDetails.transcript,
              icon: icon,
              consumed: media.consumed,
              isItemMedia: true,
            };
            const mediaWithSameTitle = this.mediaList.findIndex((m) => m.title === mediaObj.title);
            if (mediaWithSameTitle > -1) {
              this.mediaList.splice(mediaWithSameTitle, 1);
            }
            if (mediaType === 'image') {
              this.mediaList.push(mediaObj);
            }
          }
          this.mediaLoaded = true;
          this.mediaLoaded$.next(true);
        }).catch((error) => {
          this.mediaLoaded = true;
          this.mediaLoaded$.next(true);
        });
      } catch (e) {
        console.error('Error in itemmedia API!');
      }

      // });
    } else {
      this.mediaLoaded = true;
      this.mediaLoaded$.next(true);
    }
  }

  getMediaLongDescription(mediaId) {
    const media = this.mediaList.filter((m) => m.mediaId === mediaId);
    if (media.length) {
      return media[0].description;
    } else {
      return '';
    }
  }

  getMediaShortDescription(mediaId) {
    const media = this.mediaList.filter((m) => m.mediaId === mediaId);
    if (media.length) {
      return media[0].altText;
    } else {
      return '';
    }
  }

  getMediaDetails(mediaId) {
    let media = this.mediaList.filter((m) => m.mediaId === mediaId);
    if (media.length === 0) {
      media = this.mediaList.filter((m) => m.title === mediaId || this.getPatchedTitle(m.title) === mediaId || this.titleMatch(m.title, mediaId));
    }
    if (media.length) {
      return media[0];
    } else {
      return this.addMedia(mediaId);
    }
  }

  /**
 * Checks if two titles match, ignoring numeric prefixes.
 * @param {string} title - The title to compare.
 * @param {string} mediaID - The media ID to compare against.
 * @returns {boolean} True if titles match, otherwise false.
 */
  titleMatch(title: string, mediaID: string): boolean{
    const numRegex = /^\d+$/;
    const index = title.indexOf(mediaID);
    if (index !== -1) {
      const prefix = title.substring(0, index);
      const remainingValue = title.slice(index);
      return numRegex.test(prefix) && remainingValue === mediaID;
    } else {
      return false;
    }
  }

  addMedia(mediaId) {
    let mediaPath;
    if (mediaId.startsWith('/')) {
      mediaPath = this.mediaDomain + '/extMedia' + mediaId;
    } else {
      mediaPath = mediaId;
    }
    let mediaType;
    let icon;
    let title;
    if (mediaPath.lastIndexOf('/') > -1) {
      title = mediaPath.substr(mediaPath.lastIndexOf('/') + 1);
    } else {
      title = mediaPath.split('.').slice(0, -1).join('.');
    }
    const extIndex = mediaId.lastIndexOf('.');
    const ext = mediaId.slice(extIndex + 1);
    if (/jpg|png|gif|jpeg/i.test(ext)) {
      mediaType = 'image';
      icon = 'dpg-icon-image';
    }
    if (/wav|mp3|mp4|ogg/i.test(ext)) {
      mediaType = 'audio';
      icon = 'dpg-icon-av-control-play-outline';
    }
    const media = {
      mediaId: mediaId,
      type: mediaType,
      title: title,
      path: mediaPath,
      altText: '',
      description: '',
      thumbnail: '',
      caption: '',
      transcript: '',
      icon: icon,
      isItemMedia: false,
    };
    if (mediaType === 'image') {
      this.mediaList.push(media);
    }
    return media;
  }

  updateMediaConsumption(mediaInState) {
    if (this.itemmediaReceived) {
      const updatedJSON = JSON.parse(JSON.stringify(this.itemmediaResponse));
      if (updatedJSON.media) {
        for (let mediaId in updatedJSON.media) {
          if (mediaInState.includes(mediaId)) {
            updatedJSON.media[mediaId].consumed = true;
          } else {
            updatedJSON.media[mediaId].consumed = false;
          }
        }
      }
      console.log('Updated asset consumption:', updatedJSON);
      if (EZ.assetconsumption !== undefined && typeof EZ.assetconsumption === 'function') {
        EZ.assetconsumption(updatedJSON);
      }
    }
  }

  /**
   * This function is copied from CD 2.0
   * This function searches for number in the rawName parameter
   * It returns the sub string starting from the position it finds a non numeric character
   * Input:rawName (String)
   * Output:root media name (String)
   */
  getPatchedTitle(rawName) {
    let ci = 0;
    const rawNameFirstTwoDigit = rawName.substring(0, 2);//Added for CTCD-225
    const rawNameNumerics = parseInt(rawName);
    if (rawNameFirstTwoDigit == "00") {//Added for CTCD-225
      return rawName.substring(2, rawName.length);
    } else if (rawNameNumerics) {
      while (Number(rawName.charAt(ci)) || Number(rawName.charAt(ci)) == 0) {
        ci++;
      }

      return rawName.substring(ci, rawName.length);
    }
    return rawName;
  }

  isMediaUsed(state) {
    const usedMedia = [];
    if (state.frameData.frames[0].media.mediaId) {
      usedMedia.push(state.frameData.frames[0].media.mediaId);
    }
    for (const label of state.labelData.labels) {
      if (label.image.mediaId) {
        usedMedia.push(label.image.mediaId);
      }
      if (label.audio.mediaId) {
        usedMedia.push(label.audio.mediaId);
      }
    }
    for (const dock of state.dockData.docks) {
      if (dock.media.mediaId) {
        usedMedia.push(dock.media.mediaId);
      }
    }
    return usedMedia.length ? true : false;
  }
}
