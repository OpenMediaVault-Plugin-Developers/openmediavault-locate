/**
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @author    OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @copyright Copyright (c) 2009-2013 Volker Theile
 * @copyright Copyright (c) 2015-2016 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/Rpc.js")
// require("js/omv/WorkspaceManager.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")
// require("js/omv/window/MessageBox.js")
// require("js/omv/workspace/grid/Panel.js")
// require("js/omv/workspace/window/Form.js")

Ext.define("OMV.module.admin.service.locate.Search", {
    extend   : "OMV.workspace.grid.Panel",
    requires : [
        "OMV.Rpc",
        "OMV.data.Store",
        "OMV.data.Model",
        "OMV.data.proxy.Rpc"
    ],

    term : "",

    hidePagingToolbar : false,
    hideAddButton     : true,
    hideEditButton    : true,
    hideDeleteButton  : true,
    stateful          : true,
    stateId           : "bdb1c917-2ed1-4f59-c67f-bc2ef3ab2a5a",

    columnsTpl : [{
        text      : _("File / Directory"),
        sortable  : false,
        dataIndex : "file",
        stateId   : "file",
        flex      : 1
    }],

    initComponent : function() {
        var me = this;
        Ext.apply(me, {
            columns : Ext.clone(me.columnsTpl),
            store   : me.createStore()
        });
        me.callParent(arguments);
    },

    createStore: function() {
        var me = this;
        return Ext.create("OMV.data.Store", {
            autoLoad : true,
            model    : OMV.data.Model.createImplicit({
                idProperty : "file",
                fields     : [
                    { name  : "file" }
                ]
            }),
            proxy : {
                type    : "rpc",
                rpcData : {
                    service : "Locate",
                    method  : "executeSearch"
                },
                appendSortParams: true,
                extraParams : {
                    term : me.term
                }
            }
        });
    },

    getTopToolbarItems : function() {
        var me = this;
        var items = me.callParent(arguments);

        Ext.Array.insert(items, 0, [{
            xtype     : "textfield",
            value     : this.term,
            listeners : {
                scope  : me,
                change : function(combo, value) {
                    this.term = value;
                },
                specialkey : function(field, e) {
                    if (e.getKey() == e.ENTER) {
                        me.onSearchButton();
                    }
                }
            }
        },{
            xtype   : "button",
            text    : _("Search"),
            icon    : "images/search.png",
            iconCls : Ext.baseCSSPrefix + "btn-icon-16x16",
            handler : Ext.Function.bind(me.onSearchButton, me, [ me ]),
            scope   : me
        },{
            xtype   : "button",
            text    : _("Update"),
            icon    : "images/refresh.png",
            iconCls : Ext.baseCSSPrefix + "btn-icon-16x16",
            handler : Ext.Function.bind(me.onUpdateButton, me, [ me ]),
            scope   : me
        }]);
        return items;
    },

    onSearchButton : function () {
        var store = this.createStore();
        this.reconfigure(store, Ext.clone(this.columnsTpl));
        this.initState();
        this.getPagingToolbar().bindStore(this.store);
    },

    onUpdateButton : function() {
        var me = this;
        OMV.MessageBox.wait(null, _("Updating file database ..."));
        OMV.Rpc.request({
            scope       : me,
            relayErrors : false,
            rpcData     : {
                service  : "Locate",
                method   : "executeUpdate"
            },
            success : function(id, success, response) {
                me.doReload();
                me.onSearchButton();
                OMV.MessageBox.hide();
            }
        });
    }
});

OMV.WorkspaceManager.registerPanel({
    id        : "search",
    path      : "/service/locate",
    text      : _("Search"),
    position  : 10,
    className : "OMV.module.admin.service.locate.Search"
});
