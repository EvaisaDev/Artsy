window.AdminTools = {
    elements: {
        toolsContainer: $(".tools-container"),
        backupsContainer: $(".backups-container"),
        toolsToggle: $(".toggle-tools"),
        backupsToggle: $(".toggle-backups")
    },
    init: function() {
        this.backupList = null, this.currentBackup = null, this.backupBuffer = null, this.elements.toolsToggle.click(function() {
            this.elements.toolsContainer.toggle(), this.elements.toolsContainer.is(":visible") && this.elements.backupsContainer.hide()
        }.bind(this)), this.elements.backupsToggle.click(function() {
            this.elements.backupsContainer.toggle(), this.elements.backupsContainer.is(":visible") && (this.elements.toolsContainer.hide(), null === this.backupList && this.loadBackups())
        }.bind(this)), this.initTools(), this.initContextMenus()
    },
    initTools: function() {
        var t = $("<div>", {
                text: "Clear Square"
            }),
            n = $("<div>", {
                text: "Restore Section"
            }),
            i = $("<div>", {
                text: "Return to live board"
            });
        n.click(function() {
            null !== this.backupBuffer && ModTools.startSelectionMode(function(t, n) {
                $.post({
                    url: "/admin/restore",
                    data: {
                        startx: t.x,
                        starty: t.y,
                        endx: n.x,
                        endy: n.y,
                        filename: this.currentBackup
                    }
                }).done(function() {
                    i.click()
                }.bind(this))
            }.bind(this))
        }.bind(this)), t.click(this.toolClearSquare.bind(this)), i.click(function() {
            $.get("/boarddata", function(t) {
                App.drawBoard(t), App.socket.connected || App.initSocket()
            }.bind(this))
        }.bind(this)), this.elements.toolsContainer.append(t)
    },
    toolClearSquare: function() {
        ModTools.startSelectionMode(function(t, n) {
            $.post({
                url: "/admin/delete",
                data: {
                    startx: t.x,
                    starty: t.y,
                    endx: n.x,
                    endy: n.y
                }
            })
        }.bind(this))
    },
    loadBackups: function() {
        this.elements.backupsContainer.empty(), $.get("/admin/backups", function(t) {
            t.forEach(function(t) {
                var n = $("<div>", {
                    class: "backup"
                }).text(t);
                n.click(function() {
                    this.loadBackup(t)
                }.bind(this)), this.elements.backupsContainer.append(n)
            }.bind(this)), this.backupList = t
        }.bind(this)).fail(function(t) {
            $("<div>").text("Failed to load backups: " + t.responseText).appendTo(this.elements.backupsContainer), console.log(error)
        }.bind(this))
    },
    loadBackup: function(t) {
        App.alert(t), this.currentBackup = t, $.get("/admin/backup/" + t, function(t) {
            var n = App.width * App.height;
            this.backupBuffer = new Uint32Array(n);
            for (var i = 0; i < n; i++) this.backupBuffer[i] = t.charCodeAt(i);
            App.socket.close(), App.drawBoard(t)
        }.bind(this))
    },
    initContextMenus: function() {
        $.contextMenu({
            selector: ".backup",
            trigger: "right",
            zIndex: 1e3,
            items: {
                restore: {
                    name: "Restore Entire Backup",
                    callback: function(t, n) {
                        this.confirmBackupRestore(n.$trigger.text())
                    }.bind(this)
                }
            }
        })
    },
    confirmBackupRestore: function(t) {
        swal({
            title: "Restore " + t,
            type: "warning",
            showCancelButton: !0,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Confirm"
        }, function() {})
    }
}, AdminTools.init();