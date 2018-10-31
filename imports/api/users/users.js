import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Permissions } from '/imports/api/users/permissions'

Meteor.methods({
  "admin.findUsers"(skip) {
    
    if (!Permissions.isAdmin(Meteor.userId())) {
      throw new Meteor.Error(401, "not-authorized");
    }

    const perPage = 10;

    if (!skip) {
      skip = 0;
    }

    const count = Meteor.users.find({}).count();

    const data = Meteor.users
      .find(
        {},
        {
          fields: {
            profile: 1,
            status: 1,
            statusDefault: 1,
            statusConnection: 1,
            emails: 1,
            roles: 1
          },
          skip: skip,
          limit: perPage,
          sort: {
            _id: 1
          }
        }
      )
      .fetch();

    return {
      rowsPerPage: perPage,
      totalItems: count,
      data: data
    };
  },

  "admin.updateUser"(user) {
    check(user, Object);

    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    const _id = user._id;
    delete user._id;
    Meteor.users.update(
      {
        _id: _id
      },
      {
        $set: {
          profile: user.profile,
          emails: user.emails
        }
      }
    );
  },

  "admin.deactivateUser"(userId) {
    check(userId, String);
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Permissions.setInactive(userId)
  },

  "admin.activateUser"(userId) {
    check(userId, String);
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Permissions.setActive(userId)
  }
});
