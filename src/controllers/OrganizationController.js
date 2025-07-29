const Organization = require('../models/Organizations');
const User = require('../models/User');
const { nanoid } = require('nanoid');

// POST /api/organizations/create
exports.createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    const joinCode = nanoid(6);
    const existingOrg = await Organization.findOne({ joinCode });
    if (existingOrg) return res.status(400).json({ message: 'Join code conflict. Try again.' });

    const org = new Organization({
      name,
      joinCode,
      admin: req.user._id,
      members: [req.user._id]
    });

    await org.save();
    await User.findByIdAndUpdate(req.user._id, {
      organization: org._id,
      role: 'admin'
    });

    res.status(201).json({ message: 'Organization created successfully', organization: org });
  } catch (err) {
    res.status(500).json({ message: 'Error creating organization', error: err.message });
  }
};

// POST /api/organizations/join
exports.joinOrganization = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const org = await Organization.findOne({ joinCode });

    if (!org) return res.status(404).json({ message: 'Invalid join code' });
    if (org.members.includes(req.user._id)) return res.status(400).json({ message: 'Already a member' });

    org.members.push(req.user._id);
    await org.save();

    await User.findByIdAndUpdate(req.user._id, {
      organization: org._id,
      role: 'employee'
    });

    res.status(200).json({ message: 'Joined organization successfully', organization: org });
  } catch (err) {
    res.status(500).json({ message: 'Error joining organization', error: err.message });
  }
};

// GET /api/organizations/:orgId
exports.getOrganizationDetails = async (req, res) => {
  try {
    const { orgId } = req.params;
    const org = await Organization.findById(orgId).populate('members', 'name email role');

    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.status(200).json(org);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching organization', error: err.message });
  }
};

// POST /api/organizations/invite
exports.inviteMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const org = await Organization.findById(req.user.organization);

    if (!org || String(org.admin) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only admin can invite' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.organization = org._id;
    user.role = 'employee';
    await user.save();

    if (!org.members.includes(user._id)) {
      org.members.push(user._id);
      await org.save();
    }

    res.status(200).json({ message: 'Member invited successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error inviting member', error: err.message });
  }
};

// POST /api/organizations/remove-member
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const org = await Organization.findById(req.user.organization);

    if (!org || String(org.admin) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    org.members = org.members.filter(m => String(m) !== userId);
    await org.save();

    await User.findByIdAndUpdate(userId, {
      organization: null,
      role: 'employee'
    });

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing member', error: err.message });
  }
};
