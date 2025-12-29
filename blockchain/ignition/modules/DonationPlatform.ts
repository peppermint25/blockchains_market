import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SecondhandMarket", (m) => {
  const secondhandMarket = m.contract("SecondhandMarket");
  return { secondhandMarket };
});