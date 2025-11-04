export const updateActiveRole = async (req, res) => {
  try {
    const { activeRole } = req.body;
    if (!["donor", "requester"].includes(activeRole))
      return res.status(400).json({ message: "Invalid role selected." });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { activeRole },
      { new: true }
    );

    res.json({ message: `Active role set to ${activeRole}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
