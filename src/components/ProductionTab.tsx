/**
 * Production tab: potions, weapons, blueprints. E2E expects #potionButt, "Healing Herbs", "Create Potion".
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.tsx';
import { selectFullState } from '../store/index.ts';

export default function ProductionTab() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const buildings = state.buildings || [];
  const potion = state.potion || {};
  const potions = (state.potions || []).filter((p) => p.enabled === true);
  const weapons = (state.weapons || []).filter((w) => w.enabled === true);
  const blueprints = (state.blueprints || []).filter(
    (b) => b.enabled === true && (b.cost ?? 1) > 0
  );
  const stockpileName = buildings[1]?.name ?? 'Stockpile';
  const blacksmithName = buildings[3]?.name ?? 'Blacksmith';
  const marketName = buildings[2]?.name ?? 'Market';

  const potionInProgress =
    potion.working > 0 || (potion.progress && /^\d+:\d+:\d+$/.test(String(potion.progress)));
  const potionDisabled =
    potionInProgress || potion.count + (potion.working || 0) >= (potion.maxCount || 0);

  return (
    <section data-testid="production-tab" className="hv-content">
      <div className="hv-stack">
        <div className="hv-panel hv-table-card hv-mb-3">
          <div className="hv-panel__body hv-panel__body--no-pad">
            <div className="hv-table-wrap">
              <table className="hv-table">
                <thead>
                  <tr>
                    <th colSpan={7} className="hv-text-center">
                      {stockpileName}
                    </th>
                  </tr>
                  <tr>
                    <th>Item Name</th>
                    <th>Description</th>
                    <th>Stock</th>
                    <th>Prod Cost (Resource)</th>
                    <th>Prod Time</th>
                    <th>Sell Price (Gold)</th>
                    <th>Produce</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <img src="images/P_Red04.png" alt="" />
                      {potion.name}
                    </td>
                    <td>{potion.description}</td>
                    <td>
                      {potion.count ?? 0}/{potion.maxCount ?? 0}
                    </td>
                    <td>{potion.cost ?? 0}</td>
                    <td>{potion.prodTime ?? 0}</td>
                    <td>{potion.sellPrice ?? 0}</td>
                    <td>
                      <button
                        type="button"
                        id="potionButt"
                        data-testid="potion-create-button"
                        className="hv-btn-primary hv-btn-auto"
                        disabled={potionDisabled}
                        onClick={() => game.production.create(-1)}
                      >
                        {potion.progress ?? 'Create Potion'}
                      </button>
                    </td>
                  </tr>
                  {potions.map((acc) => {
                    const inProgress =
                      acc.working > 0 ||
                      (acc.progress && /^\d+:\d+:\d+$/.test(String(acc.progress)));
                    const disabled =
                      inProgress || acc.count + (acc.working || 0) >= (acc.maxCount || 0);
                    return (
                      <tr key={acc.id}>
                        <td>
                          <img src={`images/${acc.image}`} alt="" />
                          {acc.name}
                        </td>
                        <td>{acc.description}</td>
                        <td>
                          {acc.count}/{acc.maxCount}
                        </td>
                        <td>{acc.cost}</td>
                        <td>{acc.prodTime}</td>
                        <td>{acc.sellPrice}</td>
                        <td>
                          <button
                            type="button"
                            id={`p${acc.id}`}
                            className="hv-btn-primary hv-btn-auto"
                            disabled={disabled}
                            onClick={() => game.production.create(acc.id)}
                          >
                            {acc.progress ?? `Create ${acc.name}`}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {weapons.length > 0 && (
          <div className="hv-panel hv-table-card">
            <div className="hv-panel__body hv-panel__body--no-pad">
              <div className="hv-table-wrap">
                <table className="hv-table">
                  <thead>
                    <tr>
                      <th colSpan={9} className="hv-text-center">
                        {blacksmithName}
                      </th>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <th>Damage</th>
                      <th>Requirement</th>
                      <th>Durability</th>
                      <th>Stock</th>
                      <th>Prod Cost (Resource)</th>
                      <th>Prod Time</th>
                      <th>Sell Price (Gold)</th>
                      <th>Produce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weapons.map((weapon) => {
                      const inProgress =
                        weapon.working > 0 ||
                        (weapon.progress && /^\d+:\d+:\d+$/.test(String(weapon.progress)));
                      const disabled =
                        inProgress ||
                        weapon.count + (weapon.working || 0) >= (weapon.maxCount || 0);
                      return (
                        <tr key={weapon.id}>
                          <td>
                            <img src={`images/${weapon.image}`} alt="" />
                            {weapon.name}
                          </td>
                          <td>
                            {weapon.minDamage}-{weapon.maxDamage}
                          </td>
                          <td>
                            {(weapon.heroClass || [])
                              .map((c) => (state.heroClass || [])[typeof c === 'number' ? c : c.id]?.name)
                              .filter(Boolean)
                              .join(', ') || '—'}
                          </td>
                          <td>{weapon.durability}</td>
                          <td>
                            {weapon.count}/{weapon.maxCount}
                          </td>
                          <td>{weapon.cost}</td>
                          <td>{weapon.prodTime}</td>
                          <td>{Number(weapon.sellPrice).toLocaleString()}</td>
                          <td>
                            <button
                              type="button"
                              id={`w${weapon.id}`}
                              className="hv-btn-primary hv-btn-auto"
                              disabled={disabled}
                              onClick={() => game.production.purchaseWeapon(weapon.id)}
                            >
                              {weapon.progress ?? `Create ${weapon.name}`}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {blueprints.length > 0 && (
          <div className="hv-panel hv-table-card">
            <div className="hv-panel__body hv-panel__body--no-pad">
              <div className="hv-table-wrap">
                <table className="hv-table">
                  <thead>
                    <tr>
                      <th colSpan={3} className="hv-text-center">
                        {marketName}
                      </th>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <th>Cost (gold)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueprints.map((blueprint) => (
                      <tr key={blueprint.id ?? blueprint.name}>
                        <td title={blueprint.description}>{blueprint.name}</td>
                        <td>{Number(blueprint.cost).toLocaleString()}</td>
                        <td>
                          <button
                            type="button"
                            className="hv-btn-primary hv-btn-auto"
                            title={blueprint.description}
                            disabled={blueprint.cost === 0}
                            onClick={() => game.production.incrBlueprint(blueprint)}
                          >
                            Buy {blueprint.name}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
