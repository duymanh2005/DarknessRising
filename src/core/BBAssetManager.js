/**
 * Created by long.nguyen on 10/9/2017.
 */
bb.AssetManager = cc.Class.extend({
    _startDownload: false,

    startCheckUpdate: function (lis, forceDown) {
        var self = this;
        if (cc.sys.isNative) {
            this.__failCount = 0;
            this._KEY_DOWNLOADED_SIZE = "__downloaded__size__";
            this._KEY_DOWNLOADED_VERSION = "__downloaded__version__"
            var manifestPath = this._manifestPath = "res/project.manifest";
            var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote_assets/");
            cc.log("Storage path for this test : " + storagePath);
            if (jsb.fileUtils.isFileExist(storagePath + "res/project.manifest")) {
                cc.log("********* exist manifest file");
            }
            this._am = new jsb.AssetsManager(manifestPath, storagePath);
            this._am.retain();

            if (!this._am.getLocalManifest().isLoaded()) {
                cc.log("Fail to update assets, step skipped.");
            } else {
                cc.log("LOCAL VERSION MANIFEST: " + this._am.getLocalManifest().getVersion());
                cc.log("LOCAL FILE URL MANIFEST: " + this._am.getLocalManifest().getManifestFileUrl());

                var totalSize = 0;
                var downloadedSize = 0;
                var remainingSize = 0;
                var preDownloadedSize = 0;
                var listener = new jsb.EventListenerAssetsManager(this._am, function (event) {
                    cc.log("EventListenerAssetsManager: " + event.getEventCode());
                    switch (event.getEventCode()) {
                        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                            cc.log("No local manifest file found, skip assets update.");
                            lis.failManifest && lis.failManifest(event.getEventCode());
                            break;

                        case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                            var assetId = event.getAssetId();
                            cc.log("NEW_VERSION_FOUND { assetId: " + assetId + ", _startDownload: " + this._startDownload + " }");
                            if (assetId) {
                                cc.log("NEW_VERSION_FOUND: " + assetId);
                            }
                            if (!this._startDownload) {
                                lis.doNewVersionFound();
                                var tempPath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote_assets_temp/");
                                var strVersion = jsb.fileUtils.getStringFromFile(tempPath + "version.manifest");
                                if (strVersion) {
                                    var versionJson = JSON.parse(strVersion);
                                    var newVersion = versionJson["version"];
                                    cc.log("NEW VERSION FOUND: " + newVersion);

                                    var strLocalManifest = jsb.fileUtils.getStringFromFile(this._manifestPath);
                                    if (strLocalManifest) {
                                        var localManifest = JSON.parse(strLocalManifest);
                                        var strRemoteManifest = jsb.fileUtils.getStringFromFile(tempPath + "project.manifest.temp");
                                        if (strRemoteManifest) {
                                            this._startDownload = true;
                                            var localAssets = localManifest["assets"];
                                            var remoteManifest = JSON.parse(strRemoteManifest);
                                            var remoteAssets = remoteManifest["assets"];
                                            for (var assetId in remoteAssets) {
                                                if (!localAssets[assetId] ||
                                                    localAssets[assetId]['md5'] != remoteAssets[assetId]['md5']) {
                                                    totalSize += parseInt(remoteAssets[assetId]['size']);
                                                }
                                            }
                                            self._assetDownloadMap = remoteAssets;

                                            var localVersion = cc.sys.localStorage.getItem(this._KEY_DOWNLOADED_VERSION);
                                            if (newVersion != localVersion) {
                                                cc.sys.localStorage.removeItem(this._KEY_DOWNLOADED_VERSION);
                                                cc.sys.localStorage.removeItem(this._KEY_DOWNLOADED_SIZE);
                                            }
                                            cc.sys.localStorage.setItem(this._KEY_DOWNLOADED_VERSION, newVersion);
                                            downloadedSize = cc.sys.localStorage.getItem(this._KEY_DOWNLOADED_SIZE);
                                            if (!downloadedSize) {
                                                downloadedSize = 0
                                            } else {
                                                downloadedSize = parseInt(downloadedSize)
                                            }
                                            cc.log("Update Size: " + totalSize);
                                            remainingSize = totalSize - downloadedSize;
                                            remainingSize < 0 && (remainingSize = 0);
                                            lis.foundNewVersion && lis.foundNewVersion(totalSize, downloadedSize, newVersion);
                                            lis.updateDownloadSize && lis.updateDownloadSize(totalSize, downloadedSize);
                                        } 
                                    }
                                }
                            }
                            break;

                        case jsb.EventAssetsManager.ASSET_UPDATED:
                            var assetId = event.getAssetId();
                            if (assetId) {
                                cc.log("ASSET_UPDATED: " + assetId);
                            }
                            if (this._assetDownloadMap) {
                                if (assetId && this._assetDownloadMap[assetId]) {
                                    var size = this._assetDownloadMap[assetId]['size'];
                                    downloadedSize += size;
                                    cc.sys.localStorage.setItem(this._KEY_DOWNLOADED_SIZE, downloadedSize);
                                }
                            }
                            break;

                        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                            cc.log("Fail to download manifest file, update skipped. error code: " + event.getEventCode());
                            lis.failManifest && lis.failManifest(event.getEventCode());
                            break;
                        case jsb.EventAssetsManager.ERROR_UPDATING:
                            cc.log("Asset update error: " + event.getAssetId() + ", " + event.getMessage());
                            lis.errorUpdate && lis.errorUpdate(event.getEventCode());
                            break;
                        case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                            cc.log("Error decompress");
                            cc.log(event.getMessage());
                            lis.errorUpdate && lis.errorUpdate(event.getEventCode());
                            break;
                        case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                            this._percent = event.getPercent();
                            this._percentByFile = event.getPercentByFile();
        
                            var assetId = event.getAssetId();
                            cc.log("UPDATE_PROGRESSION { assetId = " + assetId + ", percent = " + this._percent + ", percentByFile = " + this._percentByFile + "}");
                            if (assetId && this._assetDownloadMap && this._assetDownloadMap[assetId]) {
                                cc.log("UPDATE_PROGRESSION call update download size");
                                var size = this._assetDownloadMap[assetId]['size'];
                                var newDownloadedSize = downloadedSize + (size * this._percent / 100);
                                if (newDownloadedSize < preDownloadedSize) {
                                    newDownloadedSize = preDownloadedSize;
                                }
                                preDownloadedSize = newDownloadedSize;
                                lis.updateDownloadSize && lis.updateDownloadSize(totalSize, newDownloadedSize);
                            }
                            break;

                        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                            cc.log("ALREADY_UP_TO_DATE finished " + event.getMessage());
                            lis.alreadyUpdate && lis.alreadyUpdate();
                            break;
                        case jsb.EventAssetsManager.UPDATE_FINISHED:
                            cc.log("UPDATE_FINISHED. " + event.getMessage());
                            // This value will be retrieved and appended to the default search path during game startup,
                            // please refer to samples/js-tests/main.js for detailed usage.
                            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
                            var searchPaths = this._am.getLocalManifest().getSearchPaths();
                            cc.log("searchPath: " + searchPaths);
                            cc.log("----------------------------");
                            for (var i = 0; i < searchPaths.length; i++) {
                                cc.log(searchPaths[i]);
                            }
                            cc.log("----------------------------");
                            // Register the manifest's search path
                            cc.sys.localStorage.setItem("_search_path_", JSON.stringify(searchPaths));
                            cc.sys.localStorage.removeItem(this._KEY_DOWNLOADED_SIZE);

                            // Restart the game to make all scripts take effect.
                            cc.log("End audio engine");
                            cc.audioEngine.end && cc.audioEngine.end();
                            cc.director.purgeCachedData();
                            cc.log("Release All");
                            cc.loader.releaseAll();
                            cc.log("Restart game");
                            cc.game.restart();
                            break;
                        case jsb.EventAssetsManager.UPDATE_FAILED:
                            cc.log("Update failed. " + event.getMessage());
                            this.__failCount++;
                            if (this.__failCount < 5) {
                                this._am.downloadFailedAssets();
                            } else {
                                cc.log("Reach maximum fail count, exit update process");
                                this.__failCount = 0;
                                lis.errorUpdate && lis.errorUpdate(event.getEventCode());
                            }
                            break;
                        default:
                            cc.log("Update failed at default");
                            break;
                    }
                }.bind(this));
                cc.eventManager.addListener(listener, 1);

                if (!forceDown) {
                    this._am.checkUpdate();
                } else {
                    cc.log("Start download new update.....");
                    this._am && this._am.update();
                }
                lis.beginProgress && lis.beginProgress();
            }
        } else {
            lis.alreadyUpdate && lis.alreadyUpdate();
        }
        return this;
    },

    getSearchPaths: function () {
        return this._am.getLocalManifest().getSearchPaths();
    },

    tryCheckUpdate: function () {
        if (this._am && !this._startDownload) {
            this._am.checkUpdate();
        }
    },

    release: function () {
        this._startDownload = false;
        if (this._am) {
            cc.log("release asset manager!");
            this._am.release();
        }
    }

});
