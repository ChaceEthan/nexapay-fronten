const connectWallet = async (req, res) => {
  try {
    const { walletPublicKey } = req.body;
    if (!walletPublicKey) {
      return res.status(400).json({ error: 'walletPublicKey is required' });
    }

    return res.status(200).json({ message: 'Wallet connect successful', walletPublicKey });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Wallet connect failed' });
  }
};

module.exports = { connectWallet };
