import * as React from 'react';
import {HTMLAttributes} from 'react';
import {ReactComponent as Add} from './add.svg';
import {ReactComponent as AddCircle} from './add-circle.svg';
import {ReactComponent as AddNote} from './notes-add.svg';
import {ReactComponent as Alert} from './alert-triangle.svg';
import {ReactComponent as AnalyticsBar} from './analytics-graph-bar.svg';
import {ReactComponent as Archive} from './archive.svg';
import {ReactComponent as ArrowDown} from './arrow-down.svg';
import {ReactComponent as ArrowLeft} from './arrow-left.svg';
import {ReactComponent as ArrowUp} from './arrow-up.svg';
import {ReactComponent as Attachment} from './attachment.svg';
import {ReactComponent as Barista} from './10-barista-male-african-american-1.svg';
import {ReactComponent as Broker} from './single-man-money.svg';
import {ReactComponent as BulletList} from './list-bullets.svg';
import {ReactComponent as Calendar} from './calendar.svg';
import {ReactComponent as Check} from './check-circle-1.svg';
import {ReactComponent as CheckSimple} from './round-check.svg';
import {ReactComponent as CheckSquare} from './check-square.svg';
import {ReactComponent as Chevron} from './chevron.svg';
import {ReactComponent as Clock} from './time-clock-circle.svg';
import {ReactComponent as CogWheel} from './cog.svg';
import {ReactComponent as Comment} from './messages-bubble-typing.svg';
import {ReactComponent as CopyPaste} from './copy-paste.svg';
import {ReactComponent as DrawerOpen} from './drawer-open.svg';
import {ReactComponent as Download} from './download-bottom.svg';
import {ReactComponent as EditPerson} from './single-neutral-actions-edit-1.svg';
import {ReactComponent as EmailReply} from './email-action-reply.svg';
import {ReactComponent as Expand} from './expand.svg';
import {ReactComponent as File} from './common-file-text.svg';
import {ReactComponent as FileCash} from './common-file-text-cash.svg';
import {ReactComponent as FileCheck} from './common-file-text-check.svg';
import {ReactComponent as FileEdit} from './common-file-text-edit.svg';
import {ReactComponent as FileQuestion} from './common-file-text-question.svg';
import {ReactComponent as Filter} from './filter-1.svg';
import {ReactComponent as Flag} from './flag-plain.svg';
import {ReactComponent as Hand} from './cursor-hand-2.svg';
import {ReactComponent as Insurance} from './hospital-shield.svg';
import {ReactComponent as LayoutNone} from './layout-none.svg';
import {ReactComponent as LayoutBullets} from './layout-bullets.svg';
import {ReactComponent as Loading} from './loading.svg';
import {ReactComponent as LoadingInline} from './inline-loading.svg';
import {ReactComponent as LocationPin} from './pin-location-1.svg';
import {ReactComponent as LocationUser} from './location-user.svg';
import {ReactComponent as ManCircle} from './single-man-circle.svg';
import {ReactComponent as ManShield} from './single-man-actions-shield.svg';
import {ReactComponent as Materials} from './equipment-cement.svg';
import {ReactComponent as Mention} from './read-email-at.svg';
import {ReactComponent as MenuHorizontal} from './navigation-menu-horizontal.svg';
import {ReactComponent as MenuVertical} from './navigation-menu-vertical.svg';
import {ReactComponent as MessageChat} from './messages-bubble-square-text.svg';
import {ReactComponent as Notification} from './alarm-bell.svg';
import {ReactComponent as Pencil} from './pencil-1.svg';
import {ReactComponent as People} from './multiple-neutral.svg';
import {ReactComponent as Pin} from './pin.svg';
import {ReactComponent as PinMap} from './pin-map.svg';
import {ReactComponent as PinMapFilled} from './pin-map-filled.svg';
import {ReactComponent as Printer} from './printer.svg';
import {ReactComponent as Remove} from './remove.svg';
import {ReactComponent as Rotate} from './synchronize-arrow-1.svg';
import {ReactComponent as Search} from './search.svg';
import {ReactComponent as Stopwatch} from './time-stopwatch-3-quarters.svg';
import {ReactComponent as SubtractCircle} from './subtract-circle.svg';
import {ReactComponent as Tags} from './tags.svg';
import {ReactComponent as TextBold} from './text-bold.svg';
import {ReactComponent as TextItalic} from './text-italic.svg';
import {ReactComponent as TextUnderlined} from './text-underline.svg';
import {ReactComponent as Tools} from './tools-wench-screwdriver.svg';
import {ReactComponent as Trash} from './bin.svg';
import {ReactComponent as Truck} from './delivery-truck-2.svg';
import {ReactComponent as View} from './view-1.svg';
import {ReactComponent as LeftArrowNavigation} from './navigation-arrows-left-1.svg';
import {ReactComponent as RightArrowNavigation} from './navigation-arrows-right-1.svg';

export enum IconName {
  Add,
  AddCircle,
  AddNote,
  Alert,
  AnalyticsBar,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Attachment,
  Barista,
  Broker,
  BulletList,
  Calendar,
  Check,
  CheckSimple,
  CheckSquare,
  Chevron,
  Clock,
  CogWheel,
  Comment,
  CopyPaste,
  DrawerOpen,
  Download,
  EditPerson,
  EmailReply,
  Expand,
  File,
  FileCash,
  FileCheck,
  FileEdit,
  FileQuestion,
  Filter,
  Flag,
  Hand,
  Insurance,
  LayoutNone,
  LayoutBullets,
  Loading,
  LoadingInline,
  LocationPin,
  LocationUser,
  ManCircle,
  ManShield,
  Materials,
  Mention,
  MenuHorizontal,
  MenuVertical,
  MessageChat,
  Notification,
  Pencil,
  People,
  Pin,
  PinMap,
  PinMapFilled,
  Printer,
  Remove,
  Rotate,
  Search,
  Stopwatch,
  SubtractCircle,
  Tags,
  TextBold,
  TextItalic,
  TextUnderlined,
  Tools,
  Trash,
  Truck,
  View,
  LeftArrowNavigation,
  RightArrowNavigation
}

const ICONS_MAP: {[key: number]: any} = {
  [IconName.Add]: Add,
  [IconName.AddCircle]: AddCircle,
  [IconName.AddNote]: AddNote,
  [IconName.Alert]: Alert,
  [IconName.AnalyticsBar]: AnalyticsBar,
  [IconName.Archive]: Archive,
  [IconName.ArrowDown]: ArrowDown,
  [IconName.ArrowLeft]: ArrowLeft,
  [IconName.ArrowUp]: ArrowUp,
  [IconName.Attachment]: Attachment,
  [IconName.Barista]: Barista,
  [IconName.Broker]: Broker,
  [IconName.BulletList]: BulletList,
  [IconName.Calendar]: Calendar,
  [IconName.Check]: Check,
  [IconName.CheckSimple]: CheckSimple,
  [IconName.CheckSquare]: CheckSquare,
  [IconName.Chevron]: Chevron,
  [IconName.Clock]: Clock,
  [IconName.CogWheel]: CogWheel,
  [IconName.Comment]: Comment,
  [IconName.CopyPaste]: CopyPaste,
  [IconName.DrawerOpen]: DrawerOpen,
  [IconName.Download]: Download,
  [IconName.EditPerson]: EditPerson,
  [IconName.EmailReply]: EmailReply,
  [IconName.Expand]: Expand,
  [IconName.File]: File,
  [IconName.FileCash]: FileCash,
  [IconName.FileCheck]: FileCheck,
  [IconName.FileEdit]: FileEdit,
  [IconName.FileQuestion]: FileQuestion,
  [IconName.Filter]: Filter,
  [IconName.Flag]: Flag,
  [IconName.Hand]: Hand,
  [IconName.Insurance]: Insurance,
  [IconName.LayoutNone]: LayoutNone,
  [IconName.LayoutBullets]: LayoutBullets,
  [IconName.Loading]: Loading,
  [IconName.LoadingInline]: LoadingInline,
  [IconName.LocationPin]: LocationPin,
  [IconName.LocationUser]: LocationUser,
  [IconName.ManCircle]: ManCircle,
  [IconName.ManShield]: ManShield,
  [IconName.Materials]: Materials,
  [IconName.Mention]: Mention,
  [IconName.MenuHorizontal]: MenuHorizontal,
  [IconName.MenuVertical]: MenuVertical,
  [IconName.MessageChat]: MessageChat,
  [IconName.Notification]: Notification,
  [IconName.Pencil]: Pencil,
  [IconName.People]: People,
  [IconName.Pin]: Pin,
  [IconName.PinMap]: PinMap,
  [IconName.PinMapFilled]: PinMapFilled,
  [IconName.Printer]: Printer,
  [IconName.Remove]: Remove,
  [IconName.Rotate]: Rotate,
  [IconName.Search]: Search,
  [IconName.Stopwatch]: Stopwatch,
  [IconName.SubtractCircle]: SubtractCircle,
  [IconName.Tags]: Tags,
  [IconName.TextBold]: TextBold,
  [IconName.TextItalic]: TextItalic,
  [IconName.TextUnderlined]: TextUnderlined,
  [IconName.Tools]: Tools,
  [IconName.Trash]: Trash,
  [IconName.Truck]: Truck,
  [IconName.LeftArrowNavigation]: LeftArrowNavigation,
  [IconName.RightArrowNavigation]: RightArrowNavigation,
  [IconName.View]: View
};

export interface IProps extends HTMLAttributes<unknown> {
  name: IconName;
  size?: number;
}

class Icon extends React.PureComponent<IProps> {
  public static defaultProps = {
    size: 20
  };

  public render() {
    const IconComponent = ICONS_MAP[this.props.name];

    return <IconComponent width={this.props.size} height={this.props.size} {...this.props} />;
  }
}

export default Icon;
