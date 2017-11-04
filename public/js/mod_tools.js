window.ModTools = {
    elements: {
        bubbleContainer: $(".bubble-container"),
        screenshotDiv: $("<div>", {
            class: "bubble"
        }).append($("<a>", {
            href: "javascript:App.toURL();"
        }).text("Screenshot")),
        spamEnabledDiv: $("<div>", {
            class: "bubble"
        }).text("Spam Enabled: false"),
        restrictedToggle: $("<div>", {
            class: "bubble restricted-toggle"
        }).text("Show Restricted Areas"),
        permaReticule: $("<div>", {
            class: "reticule"
        }).hide(),
        restrictionDiv: $("<div>", {
            class: "bubble"
        }).text("Create Restriction"),
        exitSelectionMode: $("<div>", {
            class: "bubble"
        }).text("Exit Selection Mode"),
        startSelection: $("<div>", {
            class: "bubble",
            text: "Start Position"
        }),
        endSelection: $("<div>", {
            class: "bubble",
            text: "End Position"
        }),
        confirmSelection: $("<div>", {
            class: "bubble",
            text: "Confirm Selection"
        }).hide(),
        selectionBorder: $("<div>", {
            class: "selection"
        })
    },
    enableRestrictions: !1,
    init: function() {
        $(".restricted-toggle").length && (this.enableRestrictions = !0), this.reset(), this.initContextMenu(), this.initSpamBlocks(), this.initPermaReticule(), this.initSelectionMode(), App.alert("Moderation tools loaded"), setTimeout(function() {
            App.alert(null)
        }.bind(this), 1500)
    },
    reset: function() {
        this.spamBlocksEnabled = !1, this.selectionModeEnabled = !1, this.manualStart = !1, this.manualEnd = !1, this.startSelection = null, this.endSelection = null, this.elements.spamEnabledDiv.text("Spam Enabled: false"), this.elements.startSelection.text("Start Position"), this.elements.endSelection.text("End Position"), this.elements.confirmSelection.hide(), this.initBubbles(), this.initCreateRestriction(), this.onTransform(), App.switchColor(null), App.elements.palette.show(), this.elements.permaReticule.hide()
    },
    initPermaReticule: function() {
        $(".ui").append(this.elements.permaReticule);
        var e = function(e) {
            var t = App.screenToBoardSpace(e.clientX, e.clientY);
            t.x |= 0, t.y |= 0;
            var i = App.boardToScreenSpace(t.x, t.y);
            this.elements.permaReticule.css("transform", "translate(" + i.x + "px, " + i.y + "px)"), this.elements.permaReticule.css("width", App.scale + "px").css("height", App.scale + "px")
        };
        App.elements.board.on("wheel", e.bind(this)), App.elements.board.on("mousemove", e.bind(this))
    },
    initSelectionMode: function() {
        $(".ui").append(this.elements.selectionBorder), App.elements.board.on("mousemove", this.onTransform.bind(this)), App.elements.boardContainer.on("wheel", this.onTransform.bind(this)), App.elements.boardContainer.on("mousedown", function(e) {
            downX = e.clientX, downY = e.clientY
        }).on("click", function(e) {
            if (this.selectionModeEnabled && downX === e.clientX && downY === e.clientY) {
                if (null === this.startSelection && !this.manualEnd || this.manualStart) {
                    var t = App.screenToBoardSpace(e.clientX, e.clientY);
                    if (null !== this.endSelection && (t.x > this.endSelection.x || t.y > this.endSelection.y)) return this.manualStart = !1, this.endSelection = t, void this.elements.endSelection.text("Start: (" + this.endSelection.x + ", " + this.endSelection.y + ")");
                    this.startSelection = t, this.elements.startSelection.text("Start: (" + this.startSelection.x + ", " + this.startSelection.y + ")")
                } else {
                    var t = App.screenToBoardSpace(e.clientX, e.clientY);
                    if (t.x < this.startSelection.x || t.y < this.startSelection.y) return this.manualStart = !0, this.startSelection = t, void this.elements.startSelection.text("Start: (" + this.startSelection.x + ", " + this.startSelection.y + ")");
                    this.endSelection = t, this.elements.endSelection.text("End: (" + this.endSelection.x + ", " + this.endSelection.y + ")"), null === this.startSelection && this.manualEnd && (this.manualEnd = !1, this.manualStart = !0)
                }
                null !== this.startSelection && null !== this.endSelection && this.elements.confirmSelection.show()
            }
        }.bind(this))
    },
    onTransform: function() {
        if (this.selectionModeEnabled && null !== this.startSelection && null !== this.endSelection) {
            var e = (this.endSelection.x - (this.startSelection.x - 1)) * App.scale,
                t = (this.endSelection.y - (this.startSelection.y - 1)) * App.scale,
                i = App.boardToScreenSpace(this.startSelection.x, this.startSelection.y);
            this.elements.selectionBorder.css("transform", "translate(" + i.x + "px, " + i.y + "px)"), this.elements.selectionBorder.css("width", e + "px").css("height", t + "px"), this.elements.selectionBorder.show()
        } else this.elements.selectionBorder.hide()
    },
    initBubbles: function() {
        this.elements.bubbleContainer.empty(), this.elements.bubbleContainer.append(this.elements.screenshotDiv), this.elements.bubbleContainer.append(this.elements.spamEnabledDiv), this.enableRestrictions && (this.elements.bubbleContainer.append(this.elements.restrictionDiv), App.elements.restrictedToggle = this.elements.restrictedToggle, this.elements.bubbleContainer.append(this.elements.restrictedToggle), this.elements.restrictedToggle.click(App.restrictedAreaToggle.bind(App)))
    },
    initSpamBlocks: function() {
        var e = -1,
            t = -1;
        App.elements.board.on("mousemove", function(i) {
            var n = App.screenToBoardSpace(i.clientX, i.clientY),
                s = !1;
            e !== n.x && (s = !0, e = n.x), t !== n.y && (s = !0, t = n.y), s && this.spamBlocksEnabled && App.place(e, t)
        }.bind(this)), $(document).on("mousedown", function(i) {
            2 === i.which && (this.spamBlocksEnabled = !this.spamBlocksEnabled, this.elements.spamEnabledDiv.text("Spam Enabled: " + this.spamBlocksEnabled), -1 !== e && -1 !== t && App.place(e, t), i.preventDefault())
        }.bind(this))
    },
    initCreateRestriction: function() {
        this.elements.restrictionDiv.click(function() {
            this.startSelectionMode(function(e, t) {
                this.restrictSelection(e, t), this.reset()
            }.bind(this))
        }.bind(this))
    },
    startSelectionMode: function(e) {
        this.reset(), App.elements.palette.hide(), this.elements.permaReticule.show(), this.elements.bubbleContainer.empty(), this.elements.bubbleContainer.append(this.elements.exitSelectionMode), this.elements.bubbleContainer.append(this.elements.startSelection), this.elements.bubbleContainer.append(this.elements.endSelection), this.elements.bubbleContainer.append(this.elements.confirmSelection), this.elements.startSelection.click(function() {
            this.elements.startSelection.text("Start Position"), this.manualStart = !0, this.manualEnd = !1, this.elements.confirmSelection.hide()
        }.bind(this)), this.elements.endSelection.click(function() {
            this.manualStart = !1, this.manualEnd = !0
        }.bind(this)), this.elements.exitSelectionMode.click(function() {
            this.reset()
        }.bind(this)), this.elements.confirmSelection.click(function() {
            e(this.startSelection, this.endSelection)
        }.bind(this)), this.selectionModeEnabled = !0
    },
    restrictSelection: function(e, t) {
        App.socket.emit("restriction", {
            start: e,
            end: t
        })
    },
    initContextMenu: function() {
        $.contextMenu("destroy"), ["right", "left"].forEach(function(e) {
            $.contextMenu({
                selector: ".username",
                trigger: e,
                zIndex: 1e3,
                autoHide: !0,
                items: {
                    spectate: {
                        name: "Spectate",
                        callback: function(e, t) {
                            App.spectate(t.$trigger.text())
                        }
                    },
                    mention: {
                        name: "Mention",
                        callback: function(e, t) {
                            App.mention(t.$trigger.text())
                        }
                    },
                    sep1: "",
                    cooldown: {
                        name: "Cooldown",
                        callback: function(e, t) {
                            App.socket.emit("cooldown", t.$trigger.text())
                        }
                    },
                    ban: {
                        name: "Ban",
                        callback: function(e, t) {
                            App.socket.emit("ban", t.$trigger.text())
                        }
                    }
                }
            })
        })
    }
}, ModTools.init();