/*
* adapt-contrib-audiobutton
* Harout Bezdjian @ Xtractor AB
*/
define(function(require) {

    var mep = require("components/adapt-audiobutton/js/audiobutton-and-player.min.js");
    var Adapt = require("coreJS/adapt");
    var ComponentView = require("coreViews/componentView");
    var Handlebars = require('handlebars');

    var Audiobutton = ComponentView.extend({

        preRender: function() {
            this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
            this.listenTo(Adapt, 'device:changed', this.onDeviceChanged);
            this.listenTo(this.model, 'change:_isComplete', this.removeInviewListener);
        },

        onScreenSizeChanged: function() {
            this.$('audio, video').width(this.$('.component-widget-audiobutton').width());
        },

        onDeviceChanged: function() {
            if (this.model.get('_media').source) {
                this.$('.mejs-container-audiobutton').width(this.$('.component-widget-audiobutton').width());
            }
        },

        postRender: function() {
            var mediaElement_audiobutton = this.$('audio, video').mediaelement_audiobutton({
                pluginPath:'assets/',
                success: _.bind(function (mediaElement_audiobutton, domObject) {
                    this.mediaElement_audiobutton = mediaElement_audiobutton;
                    this.setReadyStatus();
                    this.setupEventListeners();
                }, this),
                features: ['playpause','progress','current','duration']
            });

            // We're streaming - set ready now, as success won't be called above
            if (this.model.get('_media').source) {
                this.$('.audiobutton-widget').addClass('external-source');
                this.setReadyStatus();
            }
        },

        setupEventListeners: function() {
            this.completionEvent = (!this.model.get('_setCompletionOn')) ? 'play' : this.model.get('_setCompletionOn');
            if (this.completionEvent !== "inview") {
                this.mediaElement_audiobutton.addEventListener(this.completionEvent, _.bind(this.onCompletion, this));
            } else {
                this.$('.component-widget-audiobutton').on('inview', _.bind(this.inview, this));
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.setCompletionStatus();
                }
                
            }
        },

        onCompletion: function() {
            this.setCompletionStatus();
            // removeEventListener needs to pass in the method to remove the event in firefox and IE10
            this.mediaElement_audiobutton.removeEventListener(this.completionEvent, this.onCompletion);
        },

        removeInviewListener: function(model, changeAttribute) {
            if (changeAttribute && this.completionEvent === "inview") {
                this.$('.component-widget-audiobutton').off('inview');
            }
        },

        remove: function() {
            this.$('.component-widget-audiobutton').off('inview');
            Backbone.View.prototype.remove.apply(this, arguments);
        }

    });

    Adapt.register("audiobutton", Audiobutton);

    return Audiobutton;

});
