import React, { ReactNode, useState } from "react";
import Avatar from "../../shared/Avatar/Avatar";
import style from "./UserModerationCard.module.css";
import { useSessionUser } from "../../../context/SessionUserContext";
import { RadioOptions } from "../../shared/RadioOptions/RadioOptions";
import { ConfirmationDialog } from "../../shared/ConfirmationDialog/ConfirmationDialog";
import socket from "../../../socket/socket";

const data = {
  src: "/images/avatar.png",
  username: "samajat",
  role: "Member",
};

interface MemberType {
  src: string;
  username: string;
  role: string;
  isBanned: boolean;
}
const button = {
  play: "/images/icons/Ch/play.png",
  ban: "/images/icons/Ch/ban.png",
  unban: "/images/icons/Ch/unban.png",
  mute: "/images/icons/Ch/mute.png",
  unmute: "/images/icons/Ch/unmute.png",
  kick: "/images/icons/Ch/kick.png",
  setAdmin: "/images/icons/Ch/make-admin.png",
  setUser: "/images/icons/Ch/down-admin.png",
};
enum ActionType {
  BAN,
  UNBAN,
  MUTE,
  UNMUTE,
  KICK,
  PLAY,
  SETADMIN,
  SETUSER,
}

function getActionIcon(actionType: ActionType): string {
  if (actionType === ActionType.PLAY) return button.play;
  else if (actionType === ActionType.BAN) return button.ban;
  else if (actionType === ActionType.UNBAN) return button.unban;
  else if (actionType === ActionType.MUTE) return button.mute;
  else if (actionType === ActionType.UNMUTE) return button.unmute;
  else if (actionType === ActionType.SETADMIN) return button.setAdmin;
  else if (actionType === ActionType.SETUSER) return button.setUser;
  return button.kick;
}



function getOppositeButton(currentButton: ActionType): ActionType {
  if (currentButton === ActionType.PLAY) return ActionType.PLAY;
  else if (currentButton === ActionType.BAN) return ActionType.UNBAN;
  else if (currentButton === ActionType.UNBAN) return ActionType.BAN;
  else if (currentButton === ActionType.MUTE) return ActionType.UNMUTE;
  else if (currentButton === ActionType.SETADMIN) return ActionType.SETUSER;
  else if (currentButton === ActionType.SETUSER) return ActionType.SETADMIN;
  else return ActionType.MUTE;
}

interface ModerationActionProps {
  actionData: {targeted_user: string, channel_id: string};
  actionType: ActionType;
}

function ModerationAction({actionData,  actionType }: ModerationActionProps) {
  const [showRadioOptions, setShowRadioOptions] = useState(false); // State to control the display of radio options
  const [showConfirmation, setShowShowConfirmation] = useState(false); // State to control the display of radio options
  const [currentActionType, setCurrentActionType] = useState(actionType);

  const buttonSrc = getActionIcon(currentActionType);

  const handleButtonToggle = () => {
    // Toggle between buttons when Confirm is clicked
    const OppositeButton = getOppositeButton(currentActionType);
    setCurrentActionType(OppositeButton);
  };

  const handleClickConfirmDialog = () => {
    switch (currentActionType) {
      case ActionType.UNBAN:
        socket.emit('channelUserUnBan', {target_username: actionData.targeted_user, channel_id: actionData.channel_id});
        break;

      case ActionType.UNMUTE:
        break;
      case ActionType.KICK:
          socket.emit('kickOutUser', {target_username: actionData.targeted_user, channel_id: actionData.channel_id});
        break;

      case ActionType.PLAY:
        break;

      case ActionType.SETADMIN:
          socket.emit('upgradeMemberToAdmin', {targeted_username: actionData.targeted_user, channel_id: actionData.channel_id});
        break;

      case ActionType.SETUSER:
          socket.emit('setAdminToMember', {targeted_username: actionData.targeted_user, channel_id: actionData.channel_id});
        break;
      default:
        break;
    }
  };


  const handleOptionsClick = (selectedOption: number) => {

    switch (currentActionType) {
      case ActionType.BAN:
          socket.emit('channelUserBan', {target_username: actionData.targeted_user, channel_id: actionData.channel_id, actionDuration: selectedOption});
        break;
      case ActionType.MUTE:
        break;
      default:
        break;
    }
    handleButtonToggle();
  }

  const hello = (option: string)=>{ alert(option)}

  const handleClickButton = () => {
    if (currentActionType === ActionType.BAN || currentActionType === ActionType.MUTE)
      setShowRadioOptions(true);
    else
      setShowShowConfirmation(true);
  }


  return (
    <button onClick={handleClickButton} className={style.moderation_action}>
      <img src={buttonSrc} alt={`Action: ${ActionType[currentActionType]}`} />
      {showRadioOptions && (
        <RadioOptions
          handleButtonToggle={(op)=>{handleOptionsClick(op)}}
          setShowRadioOptions={setShowRadioOptions}
          selectType={`${ActionType[currentActionType]}`}
        />
      )}
      {!showRadioOptions && showConfirmation && (
        <ConfirmationDialog
          onConfirm={handleClickConfirmDialog}
          onCancel={() => setShowShowConfirmation(false)} // Optional cancel handler
          selectType={`${ActionType[currentActionType]}`}
        />
      )}
    </button>
  );
}




interface UserModerationCardProps {
  data: MemberType;
}

// Helper function to determine if user is not the owner
function isOwner(data: MemberType) {
  return data.role === "Owner";
}

// Helper function to render moderation actions
function renderModerationActions(
  selectedChannel: string,
  data: MemberType,
  currentUser: any,
  sessionUserModeratType: string
) {
  const actions: ReactNode[] = [];
  const actionData = {targeted_user: data.username, channel_id: selectedChannel};
  if (currentUser.username === data.username) return actions;
  if (sessionUserModeratType !== 'Member') {
    if (sessionUserModeratType === 'Owner')
    {
      if (data.role ===  'Admin')
      actions.push(
        <ModerationAction key="setUser" actionData={actionData}  actionType={ActionType.SETUSER} />
      );
      else if (data.role ===  'Member')
      actions.push(
        <ModerationAction key="setAdmin" actionData={actionData}  actionType={ActionType.SETADMIN} />
      );
    }

    if (!isOwner(data)) {
      if (data.isBanned)
        actions.push(
          <ModerationAction key="unban" actionData={actionData}  actionType={ActionType.UNBAN} />
        );
      else
        actions.push(<ModerationAction  key="ban" actionData={actionData}   actionType={ActionType.BAN} />);
      
      actions.push(
        <ModerationAction  key="mute" actionData={actionData}   actionType={ActionType.MUTE} />
      );
      actions.push(
        <ModerationAction  key="kick" actionData={actionData}   actionType={ActionType.KICK} />
      );
    }
  }

  actions.push(<ModerationAction key="play" actionData={actionData}   actionType={ActionType.PLAY} />);

  return actions;
}
interface UserModerationCardProps {
  selectedChannel: string;
  currentUserIsModerator: string;
  data: MemberType;
}
export function UserModerationCard({
  selectedChannel,
  currentUserIsModerator,
  data,
}: UserModerationCardProps) {
  const currentUser = useSessionUser();

  return (
    <div className={style.moderation_card}>
      <div className={style.user_info}>
        <Avatar src={data.src} avatarToRight={false} />
        <div>
          <h3>{data.username}</h3>
          <h5>{data.role}</h5>
        </div>
      </div>
      <div className={style.action_buttons}>
        {renderModerationActions(selectedChannel, data, currentUser, currentUserIsModerator)}
      </div>
    </div>
  );
}