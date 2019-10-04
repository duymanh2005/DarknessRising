/**
 * Created by long.nguyen on 8/10/2018.
 */
mc.SelectServerDialog = bb.Dialog.extend({
    ctor:function(currServer,arrEnableServer,callback){
        this._super();

        var node = ccs.load(res.widget_select_server_dialog, "res/").node;
        this.addChild(node);

        var mapView = bb.utility.arrayToMap(node.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        var lblTitle = mapView["lblTitle"];
        var btnClose = mapView["btnClose"];
        var lvl = this._lvl = mapView["lvl"];
        var cell = mapView["cell"];
        cell.setVisible(false);
        var btnSelect = this._btnSelect = mapView['btnSelect'];

        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblServerList"));
        btnSelect.setString(mc.dictionary.getGUIString("lblSelect"));

        for(var i = 0; i < arrEnableServer.length; i++ ){
            var serverData = arrEnableServer[i];
            var cell = this._reloadServerCell(cell.clone(),serverData);
            lvl.pushBackCustomItem(cell);
        }

        btnSelect.registerTouchEvent(function(){
            var selectServerData = this._getSelectServerData();
            this.close();
            callback && callback(selectServerData);
        }.bind(this));

        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        this._selectCellView(currServer);
    },

    _selectCellView:function(serverData){
        var allCell = this._lvl.getChildren();
        for(var i = 0; i < allCell.length; i++ ){
            var data = allCell[i].getUserData();
            allCell[i].getChildByName("focus").setVisible(false);
            if( data["id"] === serverData["id"] ){
                allCell[i].getChildByName("focus").setVisible(true);
            }
        }
        if( parseInt(serverData["statusCode"]) <= -2 ){
            this._btnSelect.setColor(mc.color.BLACK_DISABLE_STRONG);
            this._btnSelect.setEnabled(false);
        }
        else{
            this._btnSelect.setColor(mc.color.WHITE_NORMAL);
            this._btnSelect.setEnabled(true);
        }
    },

    _getSelectServerData:function(){
        var selectServer = null;
        var allCell = this._lvl.getChildren();
        for(var i = 0; i < allCell.length; i++ ){
            if( allCell[i].getChildByName("focus").isVisible() ){
                selectServer = allCell[i].getUserData();
                break;
            }
        }
        return selectServer;
    },

    _reloadServerCell:function(cell,serverData){
        var cellMap = bb.utility.arrayToMap(cell.getChildren(),function(child){
            return child.getName();
        });

        var lblName = cellMap["lblName"];
        var lblStatus = cellMap["lblStatus"];
        var focus = cellMap["focus"];

        var name = serverData["name"];
        var statusCode = serverData["statusCode"];

        lblName.setString(name);
        lblStatus.setString(mc.dictionary.getGUIString(mc.storage.MAP_SERVER_STATUS_BY_CODE[statusCode]['name']));
        lblStatus.setColor(mc.storage.MAP_SERVER_STATUS_BY_CODE[statusCode]['color']);

        cell.setCascadeColorEnabled(true);
        cell.setUserData(serverData);
        cell.registerTouchEvent(function(cell){
            this._selectCellView(cell.getUserData());
        }.bind(this));
        cell.setVisible(true);
        if( parseInt(statusCode) <= -2 ){
            cell.setColor(mc.color.BLACK_DISABLE_SOFT);
        }
        else{
            cell.setColor(mc.color.WHITE_NORMAL);
        }
        return cell;
    }

});